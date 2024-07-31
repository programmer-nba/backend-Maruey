const connection = require('../../mysql_db');

exports.getUserAddress = (req, res) => {
    const customerId = req.params.id;
    if (!customerId) {
        return res.status(400).json({
          message: 'Customer ID is required',
          status: false
        });
    }
    connection.query('SELECT * FROM customers_address_card WHERE customers_id = ?', [customerId], (err, results, fields) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Error executing query');
            return;
        }
        res.status(200).json({
            message: 'success',
            status: true,
            data: results
        });
    });
};

exports.getUserEwalletTransfer = (req, res) => {
    const customerId = req.params.id;
    if (!customerId) {
        return res.status(400).json({
          message: 'Customer ID is required',
          status: false
        });
    }
    connection.query('SELECT * FROM ewallet_tranfer WHERE customers_id_fk = ?', [customerId], (err, results, fields) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Error executing query');
            return;
        }
        res.status(200).json({
            message: 'success',
            status: true,
            data: results
        });
    });
};

exports.checkIntroduceUser = async (req, res) => {
    const customerId = req.params.id;
    if (!customerId) {
        return res.status(400).json({
          message: 'Customer ID is required',
          status: false
        });
    }
    connection.query('SELECT * FROM customers WHERE user_name = ?', [customerId], (err, results, fields) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Error executing query');
            return;
        }
        res.status(200).json({
            message: 'success',
            status: true,
            data: results
        });
    });
}

exports.getUserBank = async (req, res) => {
    const customerId = req.params.id;
    if (!customerId) {
        return res.status(400).json({
          message: 'Customer ID is required',
          status: false
        });
    }
    connection.query('SELECT * FROM customers_bank WHERE customers_id = ?', [customerId], (err, results, fields) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Error executing query');
            return;
        }
        res.status(200).json({
            message: 'success',
            status: true,
            data: results
        });
    });
}

exports.getUserAddressDelivery = async (req, res) => {
    const customerId = req.params.id;
    if (!customerId) {
        return res.status(400).json({
          message: 'Customer ID is required',
          status: false
        });
    }
    connection.query('SELECT * FROM customers_address_delivery WHERE customers_id = ?', [customerId], (err, results, fields) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Error executing query');
            return;
        }
        res.status(200).json({
            message: 'success',
            status: true,
            data: results
        });
    });
}

exports.upsertUserAddressDelivery = async (req, res) => {
    const { 
        customers_id, 
        address, 
        moo,
        soi,
        road,
        tambon,
        province,
        zipcode,
        phone,
        status // 1, 2
    } = req.body;

    if (!customers_id || !status) {
        return res.status(400).json({
            message: 'customers_id and status fields are required',
            status: false
        });
    }

    const query = `
        INSERT INTO customers_address_delivery (customers_id, address, moo, soi, road, tambon, province, zipcode, phone, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            address = VALUES(address), 
            moo = VALUES(moo),
            soi = VALUES(soi),
            road = VALUES(road),
            tambon = VALUES(tambon),
            province = VALUES(province),
            zipcode = VALUES(zipcode),
            phone = VALUES(phone),
            status = VALUES(status)
    `;

    connection.query(query, [
        customers_id, 
        address, 
        moo,
        soi,
        road,
        tambon,
        province,
        zipcode,
        phone,
        status
    ], (err, results, fields) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Error executing query');
            return;
        }
        res.status(200).json({
            message: 'success',
            status: true,
            data: results
        });
    });
}

