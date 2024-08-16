const pool = require('../../mysql_db');

const query = (sql, params) => {
    return pool.query(sql, params);
};

function generateCode(length) {
    return Math.random().toString(36).substring(2, 2 + length).toUpperCase();
}

exports.jangPvActive = async (req, res) => {
    const { input_user_name_active, pv_active, currentUser } = req.body;

    try {
        // Begin transaction
        await query('START TRANSACTION');

        // Get wallet_g
        const [walletGs] = await query(
            'SELECT ewallet, id, user_name, ewallet_use, pv, bonus_total FROM customers WHERE user_name = ?',
            [currentUser.user_name]
        );
        let walletG = walletGs[0];
        //console.log('walletG', walletG);
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
        //console.log('dataUser', dataUser);
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

        //console.log('dataUser2', dataUser);

        const code = generateCode(6); // Generating a unique code
        //console.log(code);
        const jangPv = {
            code,
            customer_username: currentUser.user_name,
            to_customer_username: dataUser.user_name,
            position: qualificationId,
            date_active: pv_active === 20 ? dataUser.expire_date : dataUser.expire_date_bonus,
            bonus_percen: 150,
            pv_old: dataUser.pv,
            pv: pv_active,
            pv_balance: pvBalance,
            wallet: (pv_active * 1.5) - (pv_active * 1.5 * 0.03),
            type: '1',
            status: 'Success'
        };

        //console.log('jangPv', jangPv);

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
            tax_total: (parseFloat(jangPv.wallet) / (1 - 0.03)) - parseFloat(jangPv.wallet),
            bonus_full: parseFloat(jangPv.wallet) / (1 - 0.03),
            amt: parseFloat(jangPv.wallet),
            old_balance: parseFloat(walletG.ewallet || 0),
            balance: parseFloat(walletG.ewallet || 0) + parseFloat(jangPv.wallet),
            note_orther: 'สินสุดวันที่ ' + jangPv.date_active,
            type: 7,
            receive_date: new Date(),
            receive_time: new Date(),
            status: 2
        };
        //console.log('eWallet', eWallet);

        await query('UPDATE customers SET ewallet = ?, ewallet_use = ?, bonus_total = ?, expire_date = ?, expire_date_bonus = ? WHERE id = ?',
            [eWallet.balance, parseFloat(walletG.ewallet_use || 0) + parseFloat(jangPv.wallet), parseFloat(walletG.bonus_total || 0) + parseFloat(jangPv.wallet), dataUser.expire_date, dataUser.expire_date_bonus, walletG.id]);

        await query('INSERT INTO ewallet SET ?', [eWallet]);

        // Commit transaction
        await query('COMMIT');


        const pvData = { 
            code: code, 
            customer: currentUser.user_name, 
            to_customer_username : dataUser.user_name
        }
        //console.log("runBonusActive", pvData);
        const runBonus = await runBonusActive(pvData);
        if (!runBonus) {
            return res.status(400).json({ error: 'รันโบนัส PV ไม่สำเร็จกรุณาทำรายการไหม่อีกครั้ง 3' });
        }

        return res.status(200).json({ success: 'เแจง PV สำเร็จ' });

    } catch (error) {
        await query('ROLLBACK');
        return res.status(500).json({ error: error.message });
    }
};

const runBonusActive = async (pvData) => {
    const { code, customer, to_customer_username } = pvData;

    try {
        // Fetch jang_pv data
        const [jang_pvs] = await query(
            'SELECT * FROM jang_pv WHERE code = ? AND customer_username = ? AND to_customer_username = ?',
            [code, customer, to_customer_username]
        );

        let jang_pv = jang_pvs[0];
        if (!jang_pv) {
            return false;
        }

        let customer_username = to_customer_username;

        const [data_user_g1s] = await query(
            'SELECT name, last_name, introduce_id, user_name, upline_id, qualification_id, expire_date FROM customers WHERE user_name = ?',
            [customer_username]
        );

        let data_user_g1 = data_user_g1s[0];
        if (!data_user_g1) {
            return false;
        }

        const name_g1 = `${data_user_g1.name} ${data_user_g1.last_name}`;
        customer_username = data_user_g1.introduce_id;

        const report_bonus_active = [];
        const arr_user = [];

        for (let i = 1; i <= 7; i++) {
            let x = 'start';

            const [data_users] = await query(
                'SELECT name, last_name, introduce_id, user_name, upline_id, qualification_id, expire_date FROM customers WHERE user_name = ?',
                [customer_username]
            );

            let data_user = data_users[0];
            if (!data_user) {
                if (report_bonus_active.length > 0) {
                    await query('INSERT INTO report_bonus_active SET ?', report_bonus_active[0]); // Insert only the first object
                }
                return true;
            }

            while (x === 'start') {
                if (!data_user.name || data_user.qualification_id === 'CM') {
                    customer_username = data_user.introduce_id;

                    const [next_users] = await query(
                        'SELECT name, last_name, introduce_id, user_name, upline_id, qualification_id, expire_date FROM customers WHERE user_name = ?',
                        [customer_username]
                    );

                    let next_user = next_users[0];
                    if (!next_user) {
                        x = 'stop';
                        break;
                    }
                } else {
                    const qualification_id = data_user.qualification_id || 'CM';
                    let introduce_id = await query('SELECT introduce_id FROM customers WHERE user_name = ?', [jang_pv.to_customer_username])
                    //console.log('intro', introduce_id);
                    const bonus_active = {
                        user_name: jang_pv.to_customer_username,
                        name: name_g1,
                        introduce_id: introduce_id[0][0]?.introduce_id,
                        customer_user_active: jang_pv.customer_username,
                        customer_name_active: `${(await query('SELECT name, last_name FROM customers WHERE user_name = ?', [jang_pv.customer_username]))[0][0].name} ${(await query('SELECT last_name FROM customers WHERE user_name = ?', [jang_pv.customer_username]))[0][0].last_name}`,
                        user_name_g: data_user.user_name,
                        name_g: `${data_user.name} ${data_user.last_name}`,
                        code: jang_pv.code,
                        qualification: qualification_id,
                        g: i,
                        pv: parseFloat(jang_pv.pv),
                        code_bonus: generateCode(6),
                        percen: 10
                    };
                    //console.log('bonus_active', bonus_active);

                    const wallet_total = (parseFloat(jang_pv.pv) * 10) / 100;
                    const tax_total = (wallet_total * 3) / 100;

                    arr_user[i] = {
                        user_name: data_user.user_name,
                        lv: [i],
                        bonus_percen: 10,
                        pv: parseFloat(jang_pv.pv),
                        position: qualification_id,
                        bonus: qualification_id === 'CM' || (i >= 3 && qualification_id === 'MB') || (i >= 5 && qualification_id === 'MO' || qualification_id === 'VIP') ? 0 : wallet_total - tax_total
                    };

                    //console.log('arr_user', arr_user[i]);

                    bonus_active.tax_total = arr_user[i].bonus === 0 ? 0 : tax_total;
                    bonus_active.bonus_full = arr_user[i].bonus === 0 ? 0 : wallet_total;
                    bonus_active.bonus = arr_user[i].bonus;

                    report_bonus_active.push(bonus_active);

                    customer_username = data_user.introduce_id;

                    x = 'stop';
                    break;
                }
            }
        }

        if (report_bonus_active.length > 0) {
            // Insert each object in the report_bonus_active array individually
            for (const bonus of report_bonus_active) {
                await query('INSERT INTO report_bonus_active SET ?', bonus);
            }
        }

        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
};

exports.jangPvUpgrade = async (req, res) => {
    let { user_name, input_user_name_upgrad, pv_upgrad_input } = req.body;
    try {
        const userActionQuery = `
            SELECT ewallet, id, user_name, ewallet_use, pv, bonus_total, pv_upgrad, name, last_name 
            FROM customers 
            WHERE user_name = ?
            FOR UPDATE
        `;
        const [userActions] = await query(userActionQuery, [user_name]);
        let userAction = userActions[0];
        if (!userAction) {
            return res.send('แจง PV ไม่สำเร็จกรุณาทำรายการไหม่อีกครั้ง0');
        }

        const userActionPVOld = userAction.pv;

        const dataUserQuery = `
            SELECT 
                customers.pv,
                customers.id,
                customers.name,
                customers.last_name,
                customers.user_name,
                customers.qualification_id,
                customers.pv_upgrad,
                customers.expire_date,
                customers.introduce_id,
                dataset_qualification.id as position_id,
                dataset_qualification.pv_active,
                customers.expire_insurance_date,
                customers.status_customer
            FROM customers
            LEFT JOIN dataset_qualification ON dataset_qualification.code = customers.qualification_id
            WHERE customers.user_name = ?
        `;
        const [dataUsers] = await query(dataUserQuery, [input_user_name_upgrad]);
        let dataUser = dataUsers[0];
        if (!dataUser) {
            return res.send('แจง PV ไม่สำเร็จกรุณาทำรายการไหม่อีกครั้ง1');
        }

        const targetUserPVupgrateOld = parseFloat(dataUser.pv_upgrad);

        if (dataUser.status_customer === 'cancel') {
            return res.send('รหัสนี้ถูกยกเลิกเเล้วไม่สามารถทำรายการได้');
        }

        const pvBalance = parseFloat(userAction.pv) - pv_upgrad_input;
        if (pvBalance < 0) {
            return res.send('PV ไม่พอสำหรับการแจงอัพตำแหน่ง');
        }

        let qualificationId = dataUser.qualification_id || 'CM';
        let pvUpgradTotal = parseFloat(dataUser.pv_upgrad) + pv_upgrad_input;
        let expireDate = dataUser.expire_date;
        let positionUpdate = dataUser.qualification_id;

        const updateExpireDate = () => {
            const currentDate = new Date();
            const newExpireDate = new Date(expireDate || currentDate);
            newExpireDate.setDate(newExpireDate.getDate() + 33);
            return newExpireDate.toISOString().split('T')[0];
        };

        if (qualificationId === 'CM') {
            if (pvUpgradTotal >= 20 && pvUpgradTotal < 400 && pv_upgrad_input >= 20) {
                expireDate = updateExpireDate();
                positionUpdate = 'MB';
            } else if (pvUpgradTotal >= 400 && pvUpgradTotal < 800 && pv_upgrad_input >= 400) {
                expireDate = updateExpireDate();
                positionUpdate = 'MO';
            } else if (pvUpgradTotal >= 800 && pvUpgradTotal < 1200 && pv_upgrad_input >= 400) {
                expireDate = updateExpireDate();
                positionUpdate = 'VIP';
            } else if (pvUpgradTotal >= 1200 && pv_upgrad_input >= 400) {
                expireDate = updateExpireDate();
                positionUpdate = 'VVIP';
            }
        } else if (qualificationId === 'MB') {
            if (pvUpgradTotal >= 400 && pvUpgradTotal < 800 && pv_upgrad_input >= 400) {
                expireDate = updateExpireDate();
                positionUpdate = 'MO';
            } else if (pvUpgradTotal >= 800 && pvUpgradTotal < 1200 && pv_upgrad_input >= 400) {
                expireDate = updateExpireDate();
                positionUpdate = 'VIP';
            } else if (pvUpgradTotal >= 1200 && pv_upgrad_input >= 400) {
                expireDate = updateExpireDate();
                positionUpdate = 'VVIP';
            }
        } else if (qualificationId === 'MO') {
            if (pvUpgradTotal >= 800 && pvUpgradTotal < 1200 && pv_upgrad_input >= 400) {
                expireDate = updateExpireDate();
                positionUpdate = 'VIP';
            } else if (pvUpgradTotal >= 1200 && pv_upgrad_input >= 400) {
                expireDate = updateExpireDate();
                positionUpdate = 'VVIP';
            }
        } else if (qualificationId === 'VIP') {
            if (pvUpgradTotal >= 1200 && pv_upgrad_input >= 400) {
                expireDate = updateExpireDate();
                positionUpdate = 'VVIP';
            }
        }

        const updateCustomerQuery = `
            UPDATE customers 
            SET pv_upgrad = ?, qualification_id = ?, expire_date = ? 
            WHERE id = ?
        `;
        await query(updateCustomerQuery, [pvUpgradTotal, positionUpdate, expireDate, dataUser.id]);

        const updateUserPvQuery = `
            UPDATE customers 
            SET pv = pv - ? 
            WHERE id = ?
        `;
        await query(updateUserPvQuery, [pv_upgrad_input, userAction.id]);

        //console.log(`userAction ${userActionPVOld} --> ${userAction.pv - pv_upgrad_input}`)
        //console.log(`targetUser ${targetUserPVupgrateOld} --> ${pvUpgradTotal} | position ${dataUser.qualification_id} --> ${positionUpdate}`)

        // Simulate the loop for 8 levels of the customer's network
        let reportBonusRegister = [];
        //console.log('dataUser', dataUser);
        let customerUsername = dataUser.introduce_id;

        for (let i = 1; i <= 8; i++) {
            const runDataUserQuery = `
                SELECT *
                FROM customers 
                WHERE user_name = ?
                FOR UPDATE
            `;
            const [runDataUsers] = await query(runDataUserQuery, [customerUsername]);
            //console.log('runDataUser', runDataUsers[0])
            //console.log('customerUsername', customerUsername)
            let runDataUser = runDataUsers[0];
            if (!runDataUser) {
                break;
            }

            qualificationId = runDataUser.qualification_id || 'CM';
            let bonusPercent = 0;

            if (i === 1) {
                bonusPercent = 180;
            } else if (i === 2) {
                bonusPercent = 10;
            } else if (i >= 3 && i <= 8) {
                bonusPercent = 5;
            }

            let walletTotal = (pv_upgrad_input * bonusPercent) / 100;
            let bonusAfterTax = walletTotal - (walletTotal * 3) / 100;

            reportBonusRegister.push({
                user_name: userAction.user_name,
                name: `${userAction.name} ${userAction.last_name}`,
                regis_user_name: input_user_name_upgrad,
                regis_user_introduce_id: dataUser.introduce_id,
                regis_name: `${dataUser.name} ${dataUser.last_name}`,
                user_name_g: runDataUser.user_name,
                old_position: dataUser.qualification_id,
                new_position: positionUpdate,
                name_g: `${runDataUser.name} ${runDataUser.last_name}`,
                qualification: qualificationId,
                g: i,
                pv: pv_upgrad_input,
                code_bonus: generateCode(6),
                type: 'jangpv',
                percen: bonusPercent,
                bonus: qualificationId === 'CM' ? 0 : bonusAfterTax,
                bonus_full: walletTotal,
                tax_total: walletTotal * 0.03,
            });

            //console.log(reportBonusRegister)

            customerUsername = runDataUser.introduce_id;
        }

        const insertReportBonusRegisterQuery = `
            INSERT INTO report_bonus_register 
            (user_name, name, regis_user_name, regis_user_introduce_id, regis_name, user_name_g, old_position, new_position, name_g, qualification, g, pv, code_bonus, type, percen, bonus, bonus_full, tax_total)
            VALUES ?
        `;
        const reportBonusRegisterValues = reportBonusRegister.map(item => [
            item.user_name, item.name, item.regis_user_name, item.regis_user_introduce_id, item.regis_name, 
            item.user_name_g, item.old_position, item.new_position, item.name_g, item.qualification, 
            item.g, item.pv, item.code_bonus, item.type, item.percen, item.bonus, item.bonus_full, item.tax_total
        ]);

        await query(insertReportBonusRegisterQuery, [reportBonusRegisterValues]);

        // Update log_up_vl if qualification changed
        if (dataUser.qualification_id !== positionUpdate) {
            const logUpdateQuery = `
                INSERT INTO log_up_vl (user_name, introduce_id, old_lavel, new_lavel, status, type)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            await query(logUpdateQuery, [dataUser.user_name, dataUser.introduce_id, dataUser.qualification_id, positionUpdate, 'success', 'jangpv']);
        }

        const handleBonusRegisters = reportBonusRegister.map( async (item) => {
            await handleBonusRegister(
                item.code_bonus, input_user_name_upgrad, userAction, dataUser, positionUpdate, pv_upgrad_input, pvUpgradTotal
            )
        })

        await Promise.all(handleBonusRegisters)

        return res.status(200).json({
            message: 'success',
            status: true,
            details: `${dataUser.user_name} pv_upgrade : ${targetUserPVupgrateOld} --> ${pvUpgradTotal} | position : ${dataUser.qualification_id} --> ${positionUpdate}`,
            runabove: reportBonusRegister.length
        });
    } catch (error) {
        console.error(error);
        return res.send('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    }
};

const handleBonusRegister = async (code_bonus, input_user_name_upgrad, user_action, data_user, position_update, pv_balance, pv_upgrad_total) => {
    try {
        await query('START TRANSACTION');

        // Fetch report_bonus_register records
        const getBonusRegistersQuery = `
            SELECT * FROM report_bonus_register
            WHERE status = 'panding'
              AND bonus > 0
              AND code_bonus = ?
              AND regis_user_name = ?
        `;
        const [bonusRegisters] = await query(getBonusRegistersQuery, [code_bonus, input_user_name_upgrad]);

        for (let b = 0; b < bonusRegisters.length; b++) {
            const value = bonusRegisters[b];
            if (value.bonus > 0) {
                // Fetch customer wallet data
                const walletQuery = `
                    SELECT ewallet, id, user_name, ewallet_use, bonus_total
                    FROM customers
                    WHERE user_name = ?
                    FOR UPDATE
                `;
                const [walletData] = await query(walletQuery, [value.user_name_g]);
                const wallet_g = walletData[0];

                if (!wallet_g) {
                    throw new Error(`Customer with username ${value.user_name_g} not found`);
                }

                let wallet_g_user = wallet_g.ewallet || 0;
                let bonus_total = (wallet_g.bonus_total || 0) + value.bonus;
                let ewallet_use = wallet_g.ewallet_use || 0;

                let wallet_g_total = wallet_g_user + value.bonus;
                let ewallet_use_total = ewallet_use + value.bonus;

                // Insert into eWallet
                const insertEWalletQuery = `
                    INSERT INTO eWallet (transaction_code, customers_id_fk, customer_username, tax_total, bonus_full, amt, old_balance, balance, type, note_orther, receive_date, receive_time, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;
                const eWalletValues = [
                    code_bonus,
                    wallet_g.id,
                    value.user_name_g,
                    value.tax_total,
                    value.bonus_full,
                    value.bonus,
                    wallet_g_user,
                    wallet_g_total,
                    10,
                    `โบนัสขยายธุรกิจ รหัส ${value.user_name} แนะนำรหัส ${value.regis_user_name}`,
                    new Date(),
                    new Date(),
                    2
                ];
                await query(insertEWalletQuery, eWalletValues);

                // Update customer data
                const updateCustomerQuery = `
                    UPDATE customers
                    SET ewallet = ?, ewallet_use = ?, bonus_total = ?
                    WHERE id = ?
                `;
                await query(updateCustomerQuery, [wallet_g_total, ewallet_use_total, bonus_total, wallet_g.id]);

                // Update report_bonus_register status
                const updateBonusRegisterQuery = `
                    UPDATE report_bonus_register
                    SET status = 'success'
                    WHERE user_name_g = ?
                      AND code_bonus = ?
                      AND regis_user_name = ?
                      AND g = ?
                `;
                await query(updateBonusRegisterQuery, [value.user_name_g, code_bonus, value.regis_user_name, value.g]);
            } else {
                const updateBonusRegisterQuery = `
                    UPDATE report_bonus_register
                    SET status = 'success'
                    WHERE user_name_g = ?
                      AND code_bonus = ?
                      AND regis_user_name = ?
                      AND g = ?
                `;
                await query(updateBonusRegisterQuery, [value.user_name_g, code_bonus, value.regis_user_name, value.g]);
            }
        }

        // Handle VVIP specific logic
        if (position_update === 'VVIP') {
            const jangPv = {
                code: generateCode(),
                customer_username: user_action.user_name,
                to_customer_username: input_user_name_upgrad,
                old_position: data_user.qualification_id,
                position: position_update,
                pv_old: user_action.pv,
                pv: pv_upgrad_total,
                pv_balance: pv_balance,
                type: '3',
                status: 'Success'
            };

            const insertJangPvQuery = `
                INSERT INTO jang_pv (code, customer_username, to_customer_username, old_position, position, pv_old, pv, pv_balance, type, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;
            const jangPvValues = [
                jangPv.code,
                jangPv.customer_username,
                jangPv.to_customer_username,
                jangPv.old_position,
                jangPv.position,
                jangPv.pv_old,
                jangPv.pv,
                jangPv.pv_balance,
                jangPv.type,
                jangPv.status
            ];

            await query(insertJangPvQuery, jangPvValues);

            if (pv_upgrad_total >= 1200) {
                const insurance_date = new Date();
                insurance_date.setFullYear(insurance_date.getFullYear() + 1);
                const logInsuranceData = {
                    user_name: data_user.user_name,
                    old_exprie_date: data_user.expire_insurance_date,
                    new_exprie_date: insurance_date.toISOString().split('T')[0],
                    position: 'VVIP',
                    pv: pv_upgrad_total,
                    status: 'success',
                    type: 'jangpv'
                };
                await LogInsurance.create(logInsuranceData);

                await query(`
                    UPDATE customers
                    SET qualification_id = ?, pv_upgrad = ?, vvip_register_type = 'jangpv1200'
                    WHERE user_name = ?
                `, [position_update, pv_upgrad_total, data_user.user_name]);
            } else {
                await query(`
                    UPDATE customers
                    SET qualification_id = ?, pv_upgrad = ?, vvip_register_type = 'jangpv_vvip', pv_upgrad_vvip = ?
                    WHERE user_name = ?
                `, [position_update, pv_upgrad_total, pv_upgrad_total, data_user.user_name]);
            }
        } else {
            await query(`
                UPDATE customers
                SET qualification_id = ?, pv_upgrad = ?
                WHERE user_name = ?
            `, [position_update, pv_upgrad_total, data_user.user_name]);
        }

        // Update user_action
        await query(`
            UPDATE customers
            SET pv = ?
            WHERE id = ?
        `, [pv_balance, user_action.id]);

        await query('COMMIT');
        return { status: 200, message: `แจงอัพเกรดรหัส ${data_user.user_name} สำเร็จ` };
    } catch (error) {
        await query('ROLLBACK');
        return { status: 500, message: error.message };
    }
};