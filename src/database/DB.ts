
import dotenv from "dotenv"
dotenv.config();

import { Pool } from 'pg';
import {
    SecretsManagerClient,
    GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';


export default class DB {

    async getConnection() {
        try {
            const secret: any = await this.getCreds(process.env.VINTEL_AWS_SM_KEY!);
            if (!secret) {
                throw ("Unable to access AWS secrets for yosemite postress");
            }
            const pool = new Pool({
                host: secret.host,
                port: secret.port,
                user: secret.username,
                password: secret.password,
                database: process.env.PG_DATABASE,
                ssl: {
                    rejectUnauthorized: false // or false if using self-signed certs
                }
            });
            return pool
        } catch (err: any) {
            console.log("postgres error: ", err.message);
            throw new Error(err.message);
        }
    }

    async getYosemiteConnection() {
        try {
            const secret: any = await this.getCreds(process.env.YOSEMITE_AWS_SM_KEY!);
            if (!secret) {
                throw ("Unable to access AWS secrets for yosemite");
            }

            const pool = new Pool({
                host: process.env.YOSEMITE_HOST,
                port: Number(process.env.YOSEMITE_PORT),
                user: `${secret.username}`,
                password: `${secret.password}`,
                database: process.env.YOSEMITE_DATABASE,
                ssl: {
                    rejectUnauthorized: false // or false if using self-signed certs
                }
            });
            return pool
        } catch (err: any) {
            console.log("postres yosemite error : ", err.message);
            throw new Error(err.message);
        }
    }

    async getCreds(secretName: string): Promise<string | undefined | null> {
        try {
            const client = new SecretsManagerClient({
                region: 'us-east-2',
            });
            const command = new GetSecretValueCommand({ SecretId: secretName });
            const response = await client.send(command);

            if (response.SecretString) {
                return JSON.parse(response.SecretString);
            } else if (response.SecretBinary) {
                const buff = Buffer.from(response.SecretBinary as Uint8Array);
                const parsed = buff.toString('utf-8');
                return JSON.parse(parsed);
            }
            return null;
        } catch (err) {
            console.log("Creds Error", err)
            return null;
        }
    }
}