const pool = require('../../mysql_db');

exports.getUserAddress = async (req, res) => {
    const customerId = req.params.id;
    if (!customerId) {
        return res.status(400).json({
            message: 'Customer ID is required',
            status: false
        });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        const [results] = await connection.query('SELECT * FROM customers_address_card WHERE customers_id = ?', [customerId]);

        res.status(200).json({
            message: 'success',
            status: true,
            data: results.reverse()
        });
    } catch (err) {
        console.error('Error executing query:', err);
        res.status(500).send('Error executing query');
    } finally {
        if (connection) connection.release();
    }
};

exports.getUserEwalletTransfer = async (req, res) => {
    const customerId = req.params.id;
    if (!customerId) {
        return res.status(400).json({
            message: 'Customer ID is required',
            status: false
        });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        const [results] = await connection.query('SELECT * FROM ewallet_tranfer WHERE customers_id_fk = ?', [customerId]);

        res.status(200).json({
            message: 'success',
            status: true,
            data: results
        });
    } catch (err) {
        console.error('Error executing query:', err);
        res.status(500).send('Error executing query');
    } finally {
        if (connection) connection.release();
    }
};

exports.checkIntroduceUser = async (req, res) => {
    const customerId = req.params.id;
    if (!customerId) {
        return res.status(400).json({
            message: 'Customer ID is required',
            status: false
        });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        const [results] = await connection.query('SELECT * FROM customers WHERE user_name = ?', [customerId]);

        res.status(200).json({
            message: 'success',
            status: true,
            data: results
        });
    } catch (err) {
        console.error('Error executing query:', err);
        res.status(500).send('Error executing query');
    } finally {
        if (connection) connection.release();
    }
};

exports.getUserBank = async (req, res) => {
    const customerId = req.params.id;
    if (!customerId) {
        return res.status(400).json({
            message: 'Customer ID is required',
            status: false
        });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        const [results] = await connection.query('SELECT * FROM customers_bank WHERE customers_id = ?', [customerId]);

        res.status(200).json({
            message: 'success',
            status: true,
            data: results
        });
    } catch (err) {
        console.error('Error executing query:', err);
        res.status(500).send('Error executing query');
    } finally {
        if (connection) connection.release();
    }
};

exports.getUserAddressDelivery = async (req, res) => {
    const customerId = req.params.id;
    if (!customerId) {
        return res.status(400).json({
            message: 'Customer ID is required',
            status: false
        });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        const [results] = await connection.query('SELECT * FROM customers_address_delivery WHERE customers_id = ?', [customerId]);

        res.status(200).json({
            message: 'success',
            status: true,
            data: results
        });
    } catch (err) {
        console.error('Error executing query:', err);
        res.status(500).send('Error executing query');
    } finally {
        if (connection) connection.release();
    }
};

exports.getUserData = async (req, res) => {
    const customerId = req.params.id;
    if (!customerId) {
        return res.status(400).json({
            message: 'Customer ID is required',
            status: false
        });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        const [results] = await connection.query('SELECT * FROM customers WHERE id = ?', [customerId]);

        res.status(200).json({
            message: 'success',
            status: true,
            data: results
        });
    } catch (err) {
        console.error('Error executing query:', err);
        res.status(500).send('Error executing query');
    } finally {
        if (connection) connection.release();
    }
};

exports.getMemberData = async (req, res) => {
    const username = req.params.username;
    if (!username) {
        return res.status(400).json({
            message: 'username is required',
            status: false
        });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        const [results] = await connection.query('SELECT * FROM customers WHERE user_name = ?', [username]);

        res.status(200).json({
            message: 'success',
            status: true,
            data: results[0]
        });
    } catch (err) {
        console.error('Error executing query:', err);
        res.status(500).send('Error executing query');
    } finally {
        if (connection) connection.release();
    }
};

exports.getMemberName = async (req, res) => {
    const username = req.params.username;
    if (!username) {
        return res.status(400).json({
            message: 'username is required',
            status: false
        });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        const [results] = await connection.query('SELECT name FROM customers WHERE user_name = ?', [username]);

        res.status(200).json({
            message: 'success',
            status: true,
            data: results[0]
        });
    } catch (err) {
        console.error('Error executing query:', err);
        res.status(500).send('Error executing query');
    } finally {
        if (connection) connection.release();
    }
};

exports.getUplineData = async (req, res) => {
    const { username } = req.params;
    if (!username) {
        return res.status(400).json({
            message: 'username is required',
            status: false
        });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        const [results] = await connection.query('SELECT user_name, upline_id, type_upline, name FROM customers WHERE user_name = ?', [username]);

        res.status(200).json({
            message: 'success',
            status: true,
            data: results[0]
        });
    } catch (err) {
        console.error('Error executing query:', err);
        res.status(500).send('Error executing query');
    } finally {
        if (connection) connection.release();
    }
};

exports.getDownlineData = async (req, res) => {
    const { username } = req.params;
    if (!username) {
        return res.status(400).json({
            message: 'username is required',
            status: false
        });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        const [results] = await connection.query('SELECT user_name, upline_id, type_upline, name FROM customers WHERE upline_id = ?', [username]);

        res.status(200).json({
            message: 'success',
            status: true,
            datas: results,
            data: results[0]
        });
    } catch (err) {
        console.error('Error executing query:', err);
        res.status(500).send('Error executing query');
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
            'SELECT * FROM ewallet WHERE customer_username = ?', [username]
        );
        return res.status(200).json({message: 'success', status: true, data: results})
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({message: err.message})
    } finally {
        if (connection) connection.release();
    }
}

exports.updateAddress = async (req, res) => {
    const { user_id } = req.params;
    if (!user_id) {
        return res.status(400).json({
            message: 'user_id is required',
            status: false
        });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        const [results] = await connection.query('UPDATE user_name, upline_id, type_upline, name FROM customers WHERE id = ?', [user_id]);

        res.status(200).json({
            message: 'success',
            status: true,
            datas: results,
            data: results[0]
        });
    } catch (err) {
        console.error('Error executing query:', err);
        res.status(500).send('Error executing query');
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
        phone
    } = req.body;

    if (!customers_id) {
        return res.status(400).json({
            message: 'customers_id and status fields are required',
            status: false
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
            phone
        ]);

        res.status(200).json({
            message: 'success',
            status: true,
            data: results
        });
    } catch (err) {
        console.error('Error executing query:', err);
        res.status(500).send('Error executing query');
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
        phone
    } = req.body;

    if (!customers_id) {
        return res.status(400).json({
            message: 'customers_id and status fields are required',
            status: false
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
            phone
        ]);

        res.status(200).json({
            message: 'success',
            status: true,
            data: results
        });
    } catch (err) {
        console.error('Error executing query:', err);
        res.status(500).send('Error executing query');
    } finally {
        if (connection) connection.release();
    }
};

