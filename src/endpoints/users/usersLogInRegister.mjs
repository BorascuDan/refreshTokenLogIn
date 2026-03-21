import { Router } from "express";
import { sendJsonResponse } from "../../utils/utilFunction.mjs";
import { generateNewAccesToken, loginUser, registerUser } from "../../utils/usersAccount.mjs";

const router = Router()

router.post('/register', registerUser, (req, res) => {
  if (req.success) {
    return sendJsonResponse(res, {message: 'User creaction succesfully'});
  } else {
    return sendJsonResponse(res, {status: 400, message: 'User creaction failed'});
  }
});

router.post('/logIn', loginUser, (req, res) => {
  return sendJsonResponse(res, {message: 'User succesfully loged in'});
});

router.post('/refreshToken', generateNewAccesToken, (req, res) => {
  return sendJsonResponse(res, {message: 'Succesfully refreshed acces token'})
})
export default router;