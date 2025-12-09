
import { Request, Response } from "express"
export default class UserController {

    authorize(_req:Request, res: Response){
        try{
            res.status(200).json({success:true, message: "All good"})
        }catch(err:any){
            res.status(500).json({success:false, message: err.message})
        }
    }

}
