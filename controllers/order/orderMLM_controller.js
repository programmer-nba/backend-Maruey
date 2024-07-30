const connection = require('../../mysql_db');

exports.getUserOrders = (req, res) => {
    const customerId = req.params.id;
    if (!customerId) {
        return res.status(400).json({
          message: 'Customer ID is required',
          status: false
        });
    }
    connection.query('SELECT * FROM db_orders WHERE customers_id_fr = ?', [customerId], (err, results, fields) => {
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

exports.getOrderStatuses = (req, res) => {
    connection.query('SELECT * FROM dataset_order_status', [customerId], (err, results, fields) => {
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

