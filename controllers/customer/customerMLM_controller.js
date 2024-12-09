const pool = require("../../mysql_db");

exports.getUserAddress = async (req, res) => {
  const customerId = req.params.id;
  if (!customerId) {
    return res.status(400).json({
      message: "Customer ID is required",
      status: false,
    });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    const [results] = await connection.query(
      "SELECT * FROM customers_address_card WHERE customers_id = ?",
      [customerId]
    );

    res.status(200).json({
      message: "success",
      status: true,
      data: results.reverse(),
    });
  } catch (err) {
    console.error("Error executing query:", err);
    res.status(500).send("Error executing query");
  } finally {
    if (connection) connection.release();
  }
};

exports.getUserEwalletTransfer = async (req, res) => {
  const customerId = req.params.id;
  if (!customerId) {
    return res.status(400).json({
      message: "Customer ID is required",
      status: false,
    });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    const [results] = await connection.query(
      "SELECT * FROM ewallet_tranfer WHERE customers_id_fk = ?",
      [customerId]
    );

    res.status(200).json({
      message: "success",
      status: true,
      data: results,
    });
  } catch (err) {
    console.error("Error executing query:", err);
    res.status(500).send("Error executing query");
  } finally {
    if (connection) connection.release();
  }
};

exports.checkIntroduceUser = async (req, res) => {
  const customerId = req.params.id;
  if (!customerId) {
    return res.status(400).json({
      message: "Customer ID is required",
      status: false,
    });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    const [results] = await connection.query(
      "SELECT * FROM customers WHERE user_name = ?",
      [customerId]
    );

    res.status(200).json({
      message: "success",
      status: true,
      data: results,
    });
  } catch (err) {
    console.error("Error executing query:", err);
    res.status(500).send("Error executing query");
  } finally {
    if (connection) connection.release();
  }
};

exports.getUserBank = async (req, res) => {
  const customerId = req.params.id;
  if (!customerId) {
    return res.status(400).json({
      message: "Customer ID is required",
      status: false,
    });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    const [results] = await connection.query(
      "SELECT * FROM customers_bank WHERE customers_id = ?",
      [customerId]
    );

    res.status(200).json({
      message: "success",
      status: true,
      data: results,
    });
  } catch (err) {
    console.error("Error executing query:", err);
    res.status(500).send("Error executing query");
  } finally {
    if (connection) connection.release();
  }
};

exports.getUserAddressDelivery = async (req, res) => {
  const customerId = req.params.id;
  if (!customerId) {
    return res.status(400).json({
      message: "Customer ID is required",
      status: false,
    });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    const [results] = await connection.query(
      "SELECT * FROM customers_address_delivery WHERE customers_id = ?",
      [customerId]
    );

    res.status(200).json({
      message: "success",
      status: true,
      data: results,
    });
  } catch (err) {
    console.error("Error executing query:", err);
    res.status(500).send("Error executing query");
  } finally {
    if (connection) connection.release();
  }
};

exports.getUserData = async (req, res) => {
  const customerId = req.params.id;
  if (!customerId) {
    return res.status(400).json({
      message: "Customer ID is required",
      status: false,
    });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    const [results] = await connection.query(
      "SELECT * FROM customers WHERE id = ?",
      [customerId]
    );

    res.status(200).json({
      message: "success",
      status: true,
      data: results,
    });
  } catch (err) {
    console.error("Error executing query:", err);
    res.status(500).send("Error executing query");
  } finally {
    if (connection) connection.release();
  }
};

exports.getMemberData = async (req, res) => {
  const username = req.params.username;
  if (!username) {
    return res.status(400).json({
      message: "username is required",
      status: false,
    });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    const [results] = await connection.query(
      "SELECT * FROM customers WHERE user_name = ?",
      [username]
    );

    res.status(200).json({
      message: "success",
      status: true,
      data: results[0],
    });
  } catch (err) {
    console.error("Error executing query:", err);
    res.status(500).send("Error executing query");
  } finally {
    if (connection) connection.release();
  }
};

exports.getMemberName = async (req, res) => {
  const username = req.params.username;
  if (!username) {
    return res.status(400).json({
      message: "username is required",
      status: false,
    });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    const [results] = await connection.query(
      "SELECT name FROM customers WHERE user_name = ?",
      [username]
    );

    res.status(200).json({
      message: "success",
      status: true,
      data: results[0],
    });
  } catch (err) {
    console.error("Error executing query:", err);
    res.status(500).send("Error executing query");
  } finally {
    if (connection) connection.release();
  }
};

exports.getUplineData = async (req, res) => {
  const { username } = req.params;
  if (!username) {
    return res.status(400).json({
      message: "username is required",
      status: false,
    });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    const [results] = await connection.query(
      "SELECT user_name, upline_id, type_upline, name FROM customers WHERE user_name = ?",
      [username]
    );

    res.status(200).json({
      message: "success",
      status: true,
      data: results[0],
    });
  } catch (err) {
    console.error("Error executing query:", err);
    res.status(500).send("Error executing query");
  } finally {
    if (connection) connection.release();
  }
};

exports.getDownlineData = async (req, res) => {
  const { username } = req.params;
  if (!username) {
    return res.status(400).json({
      message: "username is required",
      status: false,
    });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    const [results] = await connection.query(
      "SELECT user_name, upline_id, type_upline, name FROM customers WHERE upline_id = ?",
      [username]
    );

    res.status(200).json({
      message: "success",
      status: true,
      datas: results,
      data: results[0],
    });
  } catch (err) {
    console.error("Error executing query:", err);
    res.status(500).send("Error executing query");
  } finally {
    if (connection) connection.release();
  }
};

exports.getUserEwallet = async (req, res) => {
  const { username } = req.params;
  let connection;
  try {
    connection = await pool.getConnection();
    const [results] = await connection.query(
      "SELECT * FROM ewallet WHERE customer_username = ?",
      [username]
    );
    return res
      .status(200)
      .json({ message: "success", status: true, data: results });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err.message });
  } finally {
    if (connection) connection.release();
  }
};

exports.updateAddress = async (req, res) => {
  const { user_id } = req.params;
  if (!user_id) {
    return res.status(400).json({
      message: "user_id is required",
      status: false,
    });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    const [results] = await connection.query(
      "UPDATE user_name, upline_id, type_upline, name FROM customers WHERE id = ?",
      [user_id]
    );

    res.status(200).json({
      message: "success",
      status: true,
      datas: results,
      data: results[0],
    });
  } catch (err) {
    console.error("Error executing query:", err);
    res.status(500).send("Error executing query");
  } finally {
    if (connection) connection.release();
  }
};

exports.upsertUserAddressCard = async (req, res) => {
  const {
    customers_id,
    address,
    moo,
    soi,
    road,
    tambon,
    district,
    province,
    zipcode,
    phone,
  } = req.body;

  if (!customers_id) {
    return res.status(400).json({
      message: "customers_id and status fields are required",
      status: false,
    });
  }

  const query = `
        INSERT INTO customers_address_card (customers_id, address, moo, soi, road, tambon, province, district, zipcode, phone)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            address = VALUES(address),
            moo = VALUES(moo),
            soi = VALUES(soi),
            road = VALUES(road),
            tambon = VALUES(tambon),
            district = VALUES(district),
            province = VALUES(province),
            zipcode = VALUES(zipcode),
            phone = VALUES(phone)
    `;

  let connection;
  try {
    connection = await pool.getConnection();
    const [results] = await connection.query(query, [
      customers_id,
      address,
      moo,
      soi,
      road,
      tambon,
      province,
      district,
      zipcode,
      phone,
    ]);

    res.status(200).json({
      message: "success",
      status: true,
      data: results,
    });
  } catch (err) {
    console.error("Error executing query:", err);
    res.status(500).send("Error executing query");
  } finally {
    if (connection) connection.release();
  }
};

exports.upsertUserAddressDelivery = async (req, res) => {
  const {
    customers_id,
    address,
    moo,
    soi,
    road,
    tambon,
    district,
    province,
    zipcode,
    phone,
  } = req.body;

  if (!customers_id) {
    return res.status(400).json({
      message: "customers_id and status fields are required",
      status: false,
    });
  }

  const query = `
        INSERT INTO customers_address_delivery (customers_id, address, moo, soi, road, tambon, province, district, zipcode, phone)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            address = VALUES(address),
            moo = VALUES(moo),
            soi = VALUES(soi),
            road = VALUES(road),
            tambon = VALUES(tambon),
            district = VALUES(district),
            province = VALUES(province),
            zipcode = VALUES(zipcode),
            phone = VALUES(phone)
    `;

  let connection;
  try {
    connection = await pool.getConnection();
    const [results] = await connection.query(query, [
      customers_id,
      address,
      moo,
      soi,
      road,
      tambon,
      province,
      district,
      zipcode,
      phone,
    ]);

    res.status(200).json({
      message: "success",
      status: true,
      data: results,
    });
  } catch (err) {
    console.error("Error executing query:", err);
    res.status(500).send("Error executing query");
  } finally {
    if (connection) connection.release();
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const sql = `
      UPDATE customers SET
        user_name = ?,
        pass_old = ?,
        password = ?,
        upline_id = ?,
        type_upline = ?,
        introduce_id = ?,
        ewallet = ?,
        ewallet_use = ?,
        ewallet_tranfer = ?,
        pv_all = ?,
        bonus_total = ?,
        pv = ?,
        pv_upgrad = ?,
        expire_date = ?,
        expire_date_bonus = ?,
        expire_insurance_date = ?,
        remain_date_num = ?,
        prefix_name = ?,
        name = ?,
        last_name = ?,
        gender = ?,
        business_name = ?,
        family_status = ?,
        id_card = ?,
        passport_no = ?,
        nation_id = ?,
        birth_day = ?,
        phone = ?,
        email = ?,
        line_id = ?,
        facebook = ?,
        profile_img = ?,
        qualification_id = ?,
        business_location_id = ?,
        regis_doc1_status = ?,
        regis_doc2_status = ?,
        regis_doc3_status = ?,
        regis_doc4_status = ?,
        vvip_register_type = ?,
        vvip_status_runbonus = ?,
        pv_upgrad_vvip = ?,
        status_runbonus_not_thai = ?,
        status_customer = ?,
        cancel_status_date = ?,
        status_runbonus_allsale_1 = ?,
        created_at = ?,
        updated_at = ?,
        deleted_at = ?,
        status_runbonus_check_all = ?,
        pv_allsale_permouth = ?,
        type_app = ?,
        status_check_runupline = ?,
        status_run_pv_upline = ?,
        pv_today_downline_b = ?,
        pv_today_downline_a = ?,
        pv_today_downline_total = ?,
        pv_today = ?,
        terms_accepted = ?,
        terms_accepted_date = ?
      WHERE ${id}
    `;

    const values = [
      data.user_name,
      data.pass_old,
      data.password,
      data.upline_id,
      data.type_upline,
      data.introduce_id,
      data.ewallet,
      data.ewallet_use,
      data.ewallet_tranfer,
      data.pv_all,
      data.bonus_total,
      data.pv,
      data.pv_upgrad,
      data.expire_date,
      data.expire_date_bonus,
      data.expire_insurance_date,
      data.remain_date_num,
      data.prefix_name,
      data.name,
      data.last_name,
      data.gender,
      data.business_name,
      data.family_status,
      data.id_card,
      data.passport_no,
      data.nation_id,
      data.birth_day,
      data.phone,
      data.email,
      data.line_id,
      data.facebook,
      data.profile_img,
      data.qualification_id,
      data.business_location_id,
      data.regis_doc1_status,
      data.regis_doc2_status,
      data.regis_doc3_status,
      data.regis_doc4_status,
      data.vvip_register_type,
      data.vvip_status_runbonus,
      data.pv_upgrad_vvip,
      data.status_runbonus_not_thai,
      data.status_customer,
      data.cancel_status_date,
      data.status_runbonus_allsale_1,
      data.created_at,
      data.updated_at,
      data.deleted_at,
      data.status_runbonus_check_all,
      data.pv_allsale_permouth,
      data.type_app,
      data.status_check_runupline,
      data.status_run_pv_upline,
      data.pv_today_downline_b,
      data.pv_today_downline_a,
      data.pv_today_downline_total,
      data.pv_today,
      data.terms_accepted,
      data.terms_accepted_date,
    ];

    const [result] = await pool.query(sql, values);
    return res.json({ success: true, result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
