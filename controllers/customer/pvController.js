const pool = require('../../mysql_db');

const query = (sql, params) => {
    return pool.query(sql, params);
};

function generateCode(length) {
    return Math.random().toString(36).substring(2, 2 + length).toUpperCase();
}

exports.jangPvActive = async (req, res) => {
    const { input_user_name_active, pv_active, currentUser } = req.body;
    //const currentUser = req.user; // Assuming you're using authentication middleware

    try {
        // Begin transaction
        await query('START TRANSACTION');

        // Get wallet_g
        const [walletGs] = await query(
            'SELECT ewallet, id, user_name, ewallet_use, pv, bonus_total FROM customers WHERE user_name = ?',
            [currentUser.user_name]
        );
        let walletG = walletGs[0];

        // Get data_user
        const [dataUsers] = await query(
            `SELECT c.pv, c.id, c.name, c.pv_upgrad, c.last_name, c.user_name, c.qualification_id,
            c.expire_date, c.expire_date_bonus, d.pv_active
            FROM customers c
            LEFT JOIN dataset_qualification d ON d.code = c.qualification_id
            WHERE c.user_name = ?`,
            [input_user_name_active]
        );

        let dataUser = dataUsers[0];
        if (!dataUser) {
            await query('ROLLBACK');
            return res.status(400).json({ error: 'เแจง PV ไม่สำเร็จกรุณาทำรายการไหม่อีกครั้ง 1' });
        }

        const qualificationId = dataUser.qualification_id || 'CM';
        const pvBalance = walletG.pv - pv_active;

        if (pvBalance < 0) {
            await query('ROLLBACK');
            return res.status(400).json({ error: 'PV ไม่พอสำหรับการแจง' });
        }

        if (dataUser.pv_upgrad >= 1200) {
            dataUser.pv_upgrad += pv_active;
        }

        if (pv_active === 20) {
            const expireDate = dataUser.expire_date ? new Date(dataUser.expire_date) : new Date();
            expireDate.setDate(expireDate.getDate() + 33);
            dataUser.expire_date = expireDate.toISOString().split('T')[0];
        }

        if (pv_active === 100) {
            const expireDateBonus = dataUser.expire_date_bonus ? new Date(dataUser.expire_date_bonus) : new Date();
            expireDateBonus.setDate(expireDateBonus.getDate() + 33);
            dataUser.expire_date_bonus = expireDateBonus.toISOString().split('T')[0];
        }

        const code = generateCode(6); // Generating a unique code
        //console.log(code);
        const jangPv = {
            code,
            customer_username: currentUser.user_name,
            to_customer_username: dataUser.user_name,
            position: qualificationId,
            date_active: new Date().toISOString().split('T')[0],
            bonus_percen: 150,
            pv_old: dataUser.pv,
            pv: pv_active,
            pv_balance: pvBalance,
            wallet: (pv_active * 1.5) - (pv_active * 1.5 * 0.03),
            type: '1',
            status: 'Success'
        };

        const [existingJangPv] = await query('SELECT * FROM jang_pv WHERE code = ?', [code]);
        //console.log(existingJangPv);
        if (existingJangPv.length) {
            await query('ROLLBACK');
            return res.status(400).json({ error: 'แจง PV ไม่สำเร็จกรุณาทำรายการไหม่อีกครั้ง 2' });
        }

        await query(
            `INSERT INTO jang_pv SET ? ON DUPLICATE KEY UPDATE ?`,
            [jangPv, jangPv]
        );

        const eWallet = {
            transaction_code: code,
            customers_id_fk: currentUser.id,
            customer_username: currentUser.user_name,
            customers_id_receive: dataUser.id,
            customers_name_receive: dataUser.user_name,
            tax_total: jangPv.wallet * 0.03,
            bonus_full: jangPv.wallet / (1 - 0.03),
            amt: jangPv.wallet,
            old_balance: walletG.ewallet || 0,
            balance: (walletG.ewallet || 0) + jangPv.wallet,
            note_orther: 'สินสุดวันที่ ' + jangPv.date_active,
            type: 7,
            receive_date: new Date(),
            receive_time: new Date(),
            status: 2
        };

        await query('UPDATE customers SET ewallet = ?, ewallet_use = ?, bonus_total = ? WHERE id = ?',
            [eWallet.balance, (walletG.ewallet_use || 0) + jangPv.wallet, (walletG.bonus_total || 0) + jangPv.wallet, walletG.id]);

        await query('INSERT INTO ewallet SET ?', [eWallet]);

        // Commit transaction
        await query('COMMIT');

        return res.status(200).json({ success: 'เแจง PV สำเร็จ' });

    } catch (error) {
        await query('ROLLBACK');
        return res.status(500).json({ error: error.message });
    }
};
