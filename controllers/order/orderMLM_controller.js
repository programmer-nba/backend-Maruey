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

exports.getOrder = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const order_id = req.params.id;
        
        if (!order_id) {
            return res.status(400).json({
                message: 'order_id is required',
                status: false
            });
        }

        const [results] = await connection.query('SELECT * FROM db_orders WHERE id = ?', [order_id]);
        const [products] = await connection.query('SELECT * FROM db_order_products_list WHERE code_order = ?', [results[0]?.code_order]);

        res.status(200).json({
            message: 'success',
            status: true,
            data: results[0],
            products: products
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

exports.getFarLocation = async (req, res) => {
    let connection;
    const { zipcode } = req.params;
    try {
        connection = await pool.getConnection();
        const [results] = await connection.query('SELECT * FROM dataset_shipping_vicinity WHERE zip_code = ?', [zipcode]);

        if (!results.length) {
            return res.status(200).json({
                message: zipcode + ' Not far',
                status: true,
                data: null,
                price: 0
            });
        }

        return res.status(200).json({
            message: 'success',
            status: true,
            data: results[0],
            price: 50
        });
    } catch (err) {
        console.log(err);
        return res.status(500).send('Error executing query');
    } finally {
        if (connection) connection.release();
    }
};