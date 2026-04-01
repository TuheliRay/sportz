import {Router} from 'express';
//new instance of router to handle all match related routes
export const matchRouter = Router();
matchRouter.get('/' , (req , res) => {
    res.status(200).json({message : "Matches List"});
})