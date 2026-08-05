import { createOTP } from "@better-auth/utils/otp";
const otp = createOTP("BcPsLufdNG50sDr-u0kohfL7XrCrpKmv");
console.log("createOTP keys:", Object.keys(otp), Object.getOwnPropertyNames(Object.getPrototypeOf(otp)));
