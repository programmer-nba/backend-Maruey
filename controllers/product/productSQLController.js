const connection = require('../../mysql_db');

exports.getAllProducts = (req, res) => {
  connection.query('SELECT * FROM products', (err, results) => {
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

exports.getAllProductsDetails = (req, res) => {
    connection.query('SELECT * FROM products_details', (err, results) => {
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

  exports.getAllProductsImages = (req, res) => {
    connection.query('SELECT * FROM products_images', (err, results) => {
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

  exports.getAllProductsCost = (req, res) => {
    connection.query('SELECT * FROM products_cost', (err, results) => {
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

