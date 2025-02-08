const axios = require("axios");

module.exports.sendotp = async (req, res) => {
  try {
    const { telephone } = req.body;
    const config = {
      method: "post",
      url: `${process.env.SMS_URL}/otp-send`,
      headers: {
        "Content-Type": "application/json",
        api_key: `${process.env.SMS_API_KEY}`,
        secret_key: `${process.env.SMS_SECRET_KEY}`,
      },
      data: JSON.stringify({
        project_key: `${process.env.SMS_PROJECT_OTP}`,
        phone: `${telephone}`,
      }),
    };
    const result = await axios(config);
    console.log(result.data);
    if (result.data.code === "000") {
      return res.status(200).send({ status: true, result: result.data.result });
    } else {
      return res.status(400).send({ status: false, ...result.data });
    }
  } catch (error) {
    return res.status(500).send({ status: false, error: error.message });
  }
};

module.exports.verifyotp = async (req, res) => {
  try {
    const { token, otp_code } = req.body;
    const config = {
      method: "post",
      url: `https://portal-otp.smsmkt.com/api/otp-validate`,
      headers: {
        "Content-Type": "application/json",
        api_key: `${process.env.SMS_API_KEY}`,
        secret_key: `${process.env.SMS_SECRET_KEY}`,
      },
      data: JSON.stringify({
        token: `${token}`,
        otp_code: `${otp_code}`,
      }),
    };
    const result = await axios(config);

    if (result.data.code === "000") {
      return res
        .status(200)
        .send({ status: true, message: "ส่ง OTP สำเร็จแล้ว" });
    } else if (result.data.code === "5000") {
      return res
        .status(400)
        .send({
          status: false,
          message: "OTP นี้หมดอายุแล้ว กรุณาทำรายการใหม่",
        });
    } else {
      return res.status(400).send({ status: false, ...result.data });
    }
  } catch (error) {
    return res.status(500).send({ status: false, error: error.message });
  }
};
