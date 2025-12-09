import DB from "../database/DB"

type userSession = {
  user_id: string;
  device_id: string;
  socket_id: string;
  fcm_token: string
}

export class WebSocketService {
  async registerUser(userSession: userSession): Promise<void> {
    const pool = await new DB().getConnection();
    await pool.query(
      `INSERT INTO scans.user_sessions (user_id, device_id, socket_id, fcm_token)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (device_id)
       DO UPDATE SET user_id =$1, socket_id = $3, fcm_token = $3`,
      [userSession.user_id, userSession.device_id, userSession.socket_id, userSession.fcm_token]
    );
  }

  async markUserDisconnected(device_id: string): Promise<void> {
    const pool = await new DB().getConnection();
    await pool.query(
      `UPDATE scans.user_sessions
       SET socket_id = NULL
       WHERE device_id = $1`,
      [device_id]
    );
  }

  async sendMessageToUser(
    userId: string,
    message: string,
    userSockets: Map<string, WebSocket>
  ): Promise<void> {
    const socket = userSockets.get(userId);
    if (socket && socket.readyState === socket.OPEN) {
      socket.send(JSON.stringify({ type: 'privateMessage', message }));
    }
  }

  async addScanInitRequest(payload: any): Promise<any> {
    const db = new DB();
    const pool = await db.getConnection();

    // make raw entry
    await pool.query(
      `INSERT INTO scans.scan_request_inits (scan_id, dna_json, status)
       VALUES ($1, $2, 1)
       ON CONFLICT (scan_id)
       DO UPDATE SET scan_id =$1, dna_json=$2`,
      [payload.dna.scanId, payload]
    );

    // make scan_request entry
    await pool.query(
      `INSERT INTO scans.scan_requests (scan_id, vin, year, make, model, vin_man, year_man, make_man, model_man, vin_ocr, user_id, fcm_token,scan_request_status, scan_request_issue, module_details, device_details)
       VALUES ($1, $2, $3, $4, $5, $6,$7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
       ON CONFLICT (scan_id)
       DO UPDATE SET scan_id =$1
      `,
      [
        payload.dna.scanId,
        payload.dna.vin,
        payload.appInput.year ?? "",
        payload.appInput.make ?? "",
        payload.appInput.model ?? "",
        payload.appInput.vinMan,
        parseInt(payload.appInput.yearMan, 10) ? parseInt(payload.appInput.yearMan, 10) : 0,
        payload.appInput.makeMan,
        payload.appInput.modelMan,
        payload.appInput.vinOcr,
        payload.user ?? "",
        payload.fcmToken ?? "",
        1,
        1,
        payload.mod,
        payload.device
      ]
    );

    // response
    if (payload.appInput.year && payload.appInput.make && payload.appInput.model) {
      //const pool2 = await db.getYosemiteConnection();
      const yearMakeModel = [parseInt(payload.appInput.year), payload.appInput.make, payload.appInput.model];
      //const yearMakeModel = [2009, 'JEEP', 'LIBERTY'];

      const payloadResult = await pool.query(`Select * from scans.response_payload where model_year=$1 AND make=$2 AND model=$3 LIMIT 1`, yearMakeModel);
      if (payloadResult.rowCount == 0) {
        return { message: "No matching payload found" };
      } else {
        await pool.query(
          `INSERT INTO scans.scan_responses (scan_id, response_version,mfg_code,year,make,model, response_payload,scan_response_status,scan_response_issue,delivery_attempts )
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10 )
       ON CONFLICT (scan_id)
       DO UPDATE SET delivery_attempts =(scans.scan_responses.delivery_attempts+1), delivered_at= NOW()
      `,
          [
            payload.dna.scanId,
            1,
            123, //payload.dna.vin.substr(0, 3),
            payload.appInput.year ?? "",
            payload.appInput.make ?? "",
            payload.appInput.model ?? "",
            payloadResult.rows[0].payload_set,
            1,
            1,
            1
          ]
        );
      }
      return { data: payloadResult.rows[0].payload_set }
    }
  }

  async addVintelScanInitRequest(payload: any): Promise<any> {
    const db = new DB();
    const pool = await db.getConnection();

    // make raw entry
    await pool.query(
      `INSERT INTO scans.scan_data_inits (scan_id, vintel_json, status)
       VALUES ($1, $2, 1)
       ON CONFLICT (scan_id)
       DO UPDATE SET scan_id =$1, vintel_json=$2`,
      [payload.dna.scanId, payload]
    );

    return { message: 'Scan completed' }
  }

  async checkScan(payload: any): Promise<any> {
    try {
      const db = new DB();
      const pool = await db.getConnection();

      // make raw entry
      const result = await pool.query(
        `SELECT vintel_json from scans.scan_data_inits WHERE scan_id=$1 LIMIT 1`,
        [payload.scanId]
      );

      if (result && result.rows) {
        return { status: 'success', data: result.rows.length ? result.rows[0] : [] }
      } else {
        return { status: 'success', message: "No record found" };
      }


    } catch (err: any) {
      return { status: 'error', message: 'Query Failed: ' + err.message }
    }
  }
}

