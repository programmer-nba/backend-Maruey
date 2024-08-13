exports.jangPvActive2 = async (req, res) => {
    const { pv_active, input_user_name_active, currentUser } = req.body;

    let connection;
    try {
        connection = await pool.getConnection();

        const [walletGs] = await connection.query(
            `SELECT ewallet, id, user_name, ewallet_use, pv, bonus_total 
             FROM customers WHERE user_name = ?`,
            [currentUser.user_name]
        );
        let walletG = walletGs[0];
        if (!walletG) {
            return res.status(400).json({ message: 'User wallet not found' });
        }

        const [dataUsers] = await connection.query(
            `SELECT customers.pv, customers.id, customers.name, customers.pv_upgrad,
                    customers.last_name, customers.user_name, customers.qualification_id,
                    customers.expire_date, customers.expire_date_bonus, dataset_qualification.pv_active
             FROM customers
             LEFT JOIN dataset_qualification ON dataset_qualification.code = customers.qualification_id
             WHERE customers.user_name = ?`,
            [input_user_name_active]
        );
        let dataUser = dataUsers[0];
        if (!dataUser) {
            return res.status(400).json({ message: 'User data not found' });
        }

        console.log(dataUser);

        //const qualificationId = dataUser.qualification_id || 'CM';
        const pvBalance = walletG.pv - pv_active;
        console.log(pvBalance);
        console.log("walletG.pv:", walletG.pv, "pv_active:", pv_active);

        if (isNaN(pvBalance)) {
            console.error("pvBalance is NaN. walletG.pv:", walletG.pv, "pv_active:", pv_active);
            return res.status(400).json({ message: "Invalid PV balance calculation" });
        }

        if (pvBalance < 0) {
            return res.status(400).json({ message: 'Insufficient PV' });
        }

        if (dataUser.pv_upgrad >= 1200) {
            dataUser.pv_upgrad += pv_active;
        }

        walletG.pv = pvBalance;

        // Handle expiration dates
        const newExpireDate = new Date();
        newExpireDate.setDate(newExpireDate.getDate() + 33);

        if (pv_active === 20) {
            dataUser.expire_date = dataUser.expire_date && new Date(dataUser.expire_date) > new Date()
                ? new Date(dataUser.expire_date).setDate(new Date(dataUser.expire_date).getDate() + 33)
                : newExpireDate;
        }

        if (pv_active === 100) {
            dataUser.expire_date_bonus = dataUser.expire_date_bonus && new Date(dataUser.expire_date_bonus) > new Date()
                ? new Date(dataUser.expire_date_bonus).setDate(new Date(dataUser.expire_date_bonus).getDate() + 33)
                : newExpireDate;
        }

        const code = generateBonusCode(6);
        const bonusFull = pv_active * 1.5;
        const pvToPrice = bonusFull - (bonusFull * 0.03);

        const jangPv = {
            //code,
            customer_username: currentUser.user_name,
            to_customer_username: dataUser.user_name,
            position: dataUser.qualification_id,
            date_active: newExpireDate,
            bonus_percen: 150,
            pv_old: dataUser.pv,
            pv: pv_active,
            pv_balance: pvBalance,
            wallet: pvToPrice,
            type: 1,
            status: 'Success'
        };

        const eWallet = {
            transaction_code: code,
            customers_id_fk: currentUser.id,
            customer_username: currentUser.user_name,
            customers_id_receive: dataUser.id,
            customers_name_receive: dataUser.user_name,
            tax_total: bonusFull * 0.03,
            bonus_full: bonusFull,
            amt: pvToPrice,
            old_balance: walletG.ewallet || 0,
            balance: (walletG.ewallet || 0) + pvToPrice,
            note_orther: `สินสุดวันที่ ${newExpireDate}`,
            type: 7,
            receive_date: new Date(),
            receive_time: new Date(),
            status: 2
        };

        walletG.ewallet = (walletG.ewallet || 0) + pvToPrice;
        walletG.bonus_total = (walletG.bonus_total || 0) + pvToPrice;
        walletG.ewallet_use = (walletG.ewallet_use || 0) + pvToPrice;

        await connection.beginTransaction();

        const [checkJangPv] = await connection.query(
            `SELECT * FROM jang_pv WHERE code = ?`, [code]
        );

        if (checkJangPv.length > 0) {
            await connection.rollback();
            return res.status(400).json({ message: 'Duplicate Jang PV code' });
        }
        console.log("dataUser:", dataUser);
        if (dataUser && dataUser.id) {
            const updateFields = {
                pv_upgrad: dataUser.pv_upgrad,
                expire_date: dataUser.expire_date,
                expire_date_bonus: dataUser.expire_date_bonus,
                // add other fields as necessary
            };
        
            await connection.query(`UPDATE customers SET ? WHERE id = ?`, [updateFields, dataUser.id]);
        } else {
            throw new Error("dataUser is invalid or id is missing");
        };

        await connection.query(
            `INSERT INTO jang_pv SET ?`, [jangPv]
        );

        await connection.query(
            `INSERT INTO ewallet SET ?`, [eWallet]
        );

        await connection.query(
            `UPDATE customers SET ? WHERE id = ?`, [walletG, walletG.id]
        );

        const RunBonusActive = await runBonusActive(code, currentUser.user_name, dataUser.user_name);

        if (RunBonusActive) {
            const [reportBonusActive] = await connection.query(
                `SELECT * FROM report_bonus_active WHERE code = ?`, [code]
            );

            for (const value of reportBonusActive) {
                if (value.bonus > 0) {
                    const [walletG] = await connection.query(
                        `SELECT ewallet, id, user_name, ewallet_use, bonus_total 
                         FROM customers WHERE user_name = ? FOR UPDATE`,
                        [value.user_name_g]
                    );

                    const walletGTotal = (walletG.ewallet || 0) + value.bonus;
                    const ewalletUseTotal = (walletG.ewallet_use || 0) + value.bonus;

                    const eWalletActive = {
                        transaction_code: value.code_bonus,
                        customers_id_fk: walletG.id,
                        customer_username: value.user_name_g,
                        customers_id_receive: dataUser.id,
                        customers_name_receive: dataUser.user_name,
                        tax_total: value.tax_total,
                        bonus_full: value.bonus_full,
                        amt: value.bonus,
                        old_balance: walletG.ewallet || 0,
                        balance: walletGTotal,
                        type: 8,
                        note_orther: `G${value.g}`,
                        receive_date: new Date(),
                        receive_time: new Date(),
                        status: 2
                    };

                    await connection.query(
                        `INSERT INTO ewallet SET ?`, [eWalletActive]
                    );

                    await connection.query(
                        `UPDATE customers SET ewallet = ?, ewallet_use = ? WHERE id = ?`,
                        [walletGTotal, ewalletUseTotal, walletG.id]
                    );

                    await connection.query(
                        `UPDATE report_bonus_active SET ewalet_old = ?, ewalet_new = ?, ewallet_use_old = ?, ewallet_use_new = ?, status = 'success', date_active = ? WHERE id = ?`,
                        [walletG.ewallet, walletGTotal, walletG.ewallet_use, ewalletUseTotal, new Date(), value.id]
                    );
                }
            }
        }

        await connection.commit();

        return res.status(200).json({ message: 'PV clarification succeeded' });
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error(error);
        return res.status(500).json({ message: error.message });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

exports.jangPvActive = async (req, res) => {
    try {
        const userName = req.user.user_name; // Assuming you get the current user's username from auth middleware

        const walletG = await db('customers')
            .select('ewallet', 'id', 'user_name', 'ewallet_use', 'pv', 'bonus_total')
            .where('user_name', userName)
            .first();

        const dataUser = await db('customers')
            .select('customers.pv', 'customers.id', 'customers.name', 'customers.pv_upgrad', 'customers.last_name', 'customers.user_name', 'customers.qualification_id', 'customers.expire_date', 'customers.expire_date_bonus', 'dataset_qualification.pv_active')
            .leftJoin('dataset_qualification', 'dataset_qualification.code', '=', 'customers.qualification_id')
            .where('user_name', req.body.input_user_name_active)
            .first();

        if (!dataUser) {
            return res.status(400).json({ error: 'Failed to allocate PV, please try again.' });
        }

        const customerUpdateUse = await Customers.lockForUpdate().findByPk(walletG.id);
        const customerUpdate = await Customers.lockForUpdate().findByPk(dataUser.id);

        //let qualificationId = dataUser.qualification_id || 'CM';
        let pvBalance = walletG.pv - req.body.pv_active;

        if (pvBalance < 0) {
            return res.status(400).json({ error: 'Insufficient PV for allocation.' });
        }

        if (dataUser.pv_upgrad >= 1200) {
            customerUpdate.pv_upgrad += req.body.pv_active;
        }

        customerUpdateUse.pv = pvBalance;

        if (req.body.pv_active == 20) {
            let startMonth = dataUser.expire_date || new Date();
            customerUpdate.expire_date = new Date(startMonth.getTime() + (33 * 24 * 60 * 60 * 1000)); // Add 33 days
        }

        if (req.body.pv_active == 100) {
            let startMonth = dataUser.expire_date_bonus || new Date();
            customerUpdate.expire_date_bonus = new Date(startMonth.getTime() + (33 * 24 * 60 * 60 * 1000)); // Add 33 days
        }

        const code = await RunCodeController.db_code_pv();

        const jangPv = {
            code,
            customer_username: userName,
            to_customer_username: dataUser.user_name,
            position: dataUser.qualification_id,
            date_active: new Date().toISOString().slice(0, 10), // Assuming it's today's date in YYYY-MM-DD format
            bonus_percen: 150,
            pv_old: dataUser.pv,
            pv: req.body.pv_active,
            pv_balance: pvBalance,
            wallet: calculatePvToPrice(req.body.pv_active),
            type: '1',
            status: 'Success'
        };

        const eWalletEntry = new eWallet({
            transaction_code: code,
            customers_id_fk: req.user.id,
            customer_username: userName,
            customers_id_receive: dataUser.id,
            customers_name_receive: dataUser.user_name,
            tax_total: calculateTax(req.body.pv_active),
            bonus_full: calculateBonus(req.body.pv_active),
            amt: jangPv.wallet,
            old_balance: walletG.ewallet || 0,
            balance: (walletG.ewallet || 0) + jangPv.wallet,
            note_orther: 'Expiry date ' + jangPv.date_active,
            type: 7,
            receive_date: new Date(),
            receive_time: new Date(),
            status: 2
        });

        await db.transaction(async trx => {
            const existingPv = await db('jang_pv').where('code', code).first().transacting(trx);

            if (existingPv) {
                throw new Error('Failed to allocate PV, please try again.');
            }

            await customerUpdate.save({ transaction: trx });
            await db('jang_pv').insert(jangPv).transacting(trx);
            await eWalletEntry.save({ transaction: trx });
            await customerUpdateUse.save({ transaction: trx });

            const bonusSuccess = await RunBonusActive.run(code, userName, dataUser.user_name);

            if (bonusSuccess) {
                const reportBonusActive = await db('report_bonus_active').where('code', code).transacting(trx);

                for (const value of reportBonusActive) {
                    if (value.bonus > 0) {
                        const walletG = await Customers.lockForUpdate().findByPk(value.customers_id_fk).transacting(trx);
                        walletG.ewallet = (walletG.ewallet || 0) + value.bonus;
                        walletG.ewallet_use = (walletG.ewallet_use || 0) + value.bonus;

                        const eWalletActive = new eWallet({
                            transaction_code: value.code_bonus,
                            customers_id_fk: walletG.id,
                            customer_username: value.user_name_g,
                            customers_id_receive: dataUser.id,
                            customers_name_receive: dataUser.user_name,
                            tax_total: value.tax_total,
                            bonus_full: value.bonus_full,
                            amt: value.bonus,
                            old_balance: walletG.ewallet || 0,
                            balance: walletG.ewallet + value.bonus,
                            type: 8,
                            note_orther: 'G' + value.g,
                            receive_date: new Date(),
                            receive_time: new Date(),
                            status: 2
                        });

                        await eWalletActive.save({ transaction: trx });
                        await walletG.save({ transaction: trx });

                        await db('report_bonus_active')
                            .where('id', value.id)
                            .update({
                                ewalet_old: walletG.ewallet,
                                ewalet_new: walletG.ewallet + value.bonus,
                                ewallet_use_old: walletG.ewallet_use,
                                ewallet_use_new: walletG.ewallet_use + value.bonus,
                                status: 'success',
                                date_active: new Date()
                            })
                            .transacting(trx);
                    }
                }
            }
        });

        res.status(200).json({ message: 'PV allocation successful.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

const runBonusActive = async (code, customer, toCustomerUsername) => {
    //let { code, customer, toCustomerUsername } = req.body;
    let connection;
    try {
        connection = await pool.getConnection();

        // Find jang_pv
        const [jangPvRows] = await connection.query(
            `SELECT * FROM jang_pv WHERE code = ? AND customer_username = ? AND to_customer_username = ? LIMIT 1`,
            [code, customer, toCustomerUsername]
        );
        const jangPv = jangPvRows[0];

        if (!jangPv) {
            return false;
        }

        let customerUsername = toCustomerUsername;

        // Find initial customer data
        const [dataUserG1Rows] = await connection.query(
            `SELECT name, last_name, introduce_id, user_name, upline_id, qualification_id, expire_date FROM customers WHERE user_name = ? LIMIT 1`,
            [customerUsername]
        );
        const dataUserG1 = dataUserG1Rows[0];

        if (!dataUserG1) {
            return false;
        }

        const nameG1 = `${dataUserG1.name} ${dataUserG1.last_name}`;
        customerUsername = dataUserG1.introduce_id;

        const reportBonusActive = [];
        const arrUser = [];

        for (let i = 1; i <= 7; i++) {
            const [dataUserRows] = await connection.query(
                `SELECT name, last_name, introduce_id, user_name, upline_id, qualification_id, expire_date FROM customers WHERE user_name = ? LIMIT 1`,
                [customerUsername]
            );
            let dataUser = dataUserRows[0];

            if (!dataUser) {
                // If no data user is found, finalize the transaction
                await connection.beginTransaction();
                await connection.query(
                    `INSERT INTO report_bonus_active (user_name, name, introduce_id, customer_user_active, customer_name_active, user_name_g, name_g, code, qualification, g, pv, code_bonus, tax_total, bonus_full, bonus) VALUES ?`,
                    [reportBonusActive.map(item => Object.values(item))]
                );
                await connection.commit();
                return true;
            }

            while (true) {
                if (!dataUser.name || dataUser.qualification_id === 'CM') {
                    customerUsername = dataUser.introduce_id;
                    const [newDataUserRows] = await connection.query(
                        `SELECT name, last_name, user_name, introduce_id, upline_id, qualification_id, expire_date FROM customers WHERE user_name = ? LIMIT 1`,
                        [customerUsername]
                    );
                    dataUser = newDataUserRows[0];
                    if (!dataUser) break;
                } else {
                    const qualificationId = dataUser.qualification_id || 'CM';

                    reportBonusActive.push({
                        user_name: jangPv.to_customer_username,
                        name: nameG1,
                        introduce_id: dataUserG1.introduce_id,
                        customer_user_active: jangPv.customer_username,
                        customer_name_active: `${dataUserG1.name} ${dataUserG1.last_name}`,
                        user_name_g: dataUser.user_name,
                        name_g: `${dataUser.name} ${dataUser.last_name}`,
                        code: jangPv.code,
                        qualification: qualificationId,
                        g: i,
                        pv: jangPv.pv,
                        code_bonus: generateBonusCode(6),
                        tax_total: 0,
                        bonus_full: 0,
                        bonus: 0,
                    });

                    const walletTotal = qualificationId !== 'CM' ? jangPv.pv * 0.10 : 0;
                    if (i <= 2 || (i > 2 && qualificationId !== 'MB' && qualificationId !== 'MO' && qualificationId !== 'VIP')) {
                        reportBonusActive[i - 1].tax_total = walletTotal * 0.03;
                        reportBonusActive[i - 1].bonus_full = walletTotal;
                        reportBonusActive[i - 1].bonus = walletTotal - reportBonusActive[i - 1].tax_total;
                    }

                    arrUser.push({
                        user_name: dataUser.user_name,
                        lv: i,
                        bonus_percen: 10,
                        pv: jangPv.pv,
                        position: qualificationId,
                        bonus: walletTotal,
                    });

                    customerUsername = dataUser.introduce_id;
                    break;
                }
            }
        }

        await connection.beginTransaction();
        await connection.query(
            `INSERT INTO report_bonus_active (user_name, name, introduce_id, customer_user_active, customer_name_active, user_name_g, name_g, code, qualification, g, pv, code_bonus, tax_total, bonus_full, bonus) VALUES ?`,
            [reportBonusActive.map(item => Object.values(item))]
        );
        await connection.commit();

        return true;
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error(error);
        return false;
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

function generateBonusCode(length) {
    return Math.random().toString(36).substring(2, 2 + length).toUpperCase();
}