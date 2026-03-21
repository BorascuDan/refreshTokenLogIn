import { Router } from "express";
import user from "../endpoints/users/usersLogInRegister.mjs"
import { authenticateToken } from "../utils/usersAccount.mjs";
//import componenta from "./../endpoints/componenta";
const router = Router()

//router.use('/name/', componenta);
router.use('/users/', user)
router.use(authenticateToken)
export default router;