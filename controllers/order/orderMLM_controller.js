const pool = require('../../mysql_db');

exports.getUserOrders = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const customerId = req.params.id;
        
        if (!customerId) {
            return res.status(400).json({
                message: 'Customer ID is required',
                status: false
            });
        }

        const [results] = await connection.query('SELECT * FROM db_orders WHERE customers_id_fk = ?', [customerId]);

        res.status(200).json({
            message: 'success',
            status: true,
            data: results
        });
    } catch (err) {
        console.log(err);
        res.status(500).send('Error executing query');
    } finally {
        if (connection) connection.release();
    }
};

exports.createOrder = async (req, res) => {
    const customerId = req.params.id;
    if (!customerId) {
        return res.status(400).json({
            message: 'Customer ID is required',
            status: false
        });
    }
    res.status(200).json({
        message: 'success',
        status: true,
        data: req.body
    });
};

exports.getShippingCosts = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [results] = await connection.query('SELECT * FROM dataset_shipping_cost');

        res.status(200).json({
            message: 'success',
            status: true,
            data: results
        });
    } catch (err) {
        console.log(err);
        res.status(500).send('Error executing query');
    } finally {
        if (connection) connection.release();
    }
};

exports.getShippingTypes = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [results] = await connection.query('SELECT * FROM dataset_shipping_type');

        res.status(200).json({
            message: 'success',
            status: true,
            data: results
        });
    } catch (err) {
        console.log(err);
        res.status(500).send('Error executing query');
    } finally {
        if (connection) connection.release();
    }
};

exports.getOrderStatuses = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [results] = await connection.query('SELECT * FROM dataset_order_status');

        res.status(200).json({
            message: 'success',
            status: true,
            data: results
        });
    } catch (err) {
        console.log(err);
        res.status(500).send('Error executing query');
    } finally {
        if (connection) connection.release();
    }
};