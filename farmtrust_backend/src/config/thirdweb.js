import { ThirdwebAuth } from "@thirdweb-dev/auth/express";
import dotenv from "dotenv";
dotenv.config();

const thirdwebAuth = ThirdwebAuth({
  domain: "farmtrust.com",
  wallet: {
    privateKey: process.env.THIRDWEB_WALLET_PRIVATE_KEY,
  },
});

export default thirdwebAuth;
