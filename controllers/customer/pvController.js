const pool = require('../../mysql_db');
const axios = require('axios');

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const query = (sql, params) => {
    return pool.query(sql, params);
};

function generateCode(length) {
    return Math.random().toString(36).substring(2, 2 + length).toUpperCase();
}

async function generateCodeBonus() {
    try {
        //const {data} = await axios.get('https://golf4.orangeworkshop.info/mlm/api/db_code_bonus/2')
        const {data} = await axios.get('https://maruayduaykan.com/api/db_code_bonus/2')
        if (data) return data
        else return generateCode(6)
    }
    catch(err) {
        //console.log(err)
        return generateCode(6)
    }
}

async function generateCodePv() {
    try {
        //const {data} = await axios.get('https://golf4.orangeworkshop.info/mlm/api/db_code_pv')
        const {data} = await axios.get('https://maruayduaykan.com/api/db_code_pv')
        if (data) return data
        else return generateCode(6)
    }
    catch(err) {
        //console.log(err)
        return generateCode(6)
    }
}

exports.getUserJangPv = async (req, res) => {
    const { username } = req.params;
    try {
        const [results] = await query(
            'SELECT * FROM jang_pv WHERE customer_username = ? OR to_customer_username = ?', [username, username]
        );
        return res.status(200).json({message: 'success', status: true, data: results})
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({message: err.message})
    }
}

exports.jangPvActive = async (req, res) => {
    const { input_user_name_active, pv_active, currentUser } = req.body;
    try {
        await delay(Math.floor(Math.random() * (5000 - 1000 + 1)) + 1000);

        let codePv = await generateCodePv();
        console.log('codePv', codePv);
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
            return res.status(400).json({ error: 'แจง PV ไม่สำเร็จกรุณาทำรายการไหม่อีกครั้ง 1' });
        }

        const qualificationId = dataUser.qualification_id || 'MC';
        const pvBalance = parseFloat(walletG.pv) - pv_active;

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

        //const code = codePv; // Generating a unique code
        //console.log('code', code);
        const jangPv = {
            code: codePv,
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
            status: 'Success',
            type_app: 'app',
        };

        //console.log('jangPv', jangPv);

        const [existingJangPv] = await query('SELECT * FROM jang_pv WHERE code = ?', [codePv]);
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
            transaction_code: codePv,
            customers_id_fk: currentUser.id,
            customer_username: currentUser.user_name,
            customers_id_receive: dataUser.id,
            customers_name_receive: dataUser.user_name,
            tax_total: (parseFloat(jangPv.wallet) / (1 - 0.03)) - parseFloat(jangPv.wallet),
            bonus_full: parseFloat(jangPv.wallet) / (1 - 0.03),
            amt: parseFloat(jangPv.wallet),
            old_balance: parseFloat(walletG.ewallet || 0) >= 9999999.99 ? 9999999.99 : parseFloat(walletG.ewallet || 0),
            balance: parseFloat(walletG.ewallet || 0) + parseFloat(jangPv.wallet) >= 9999999.99 ? 9999999.99 : parseFloat(walletG.ewallet || 0) + parseFloat(jangPv.wallet),
            note_orther: 'สินสุดวันที่ ' + jangPv.date_active,
            type: 7,
            receive_date: new Date(),
            receive_time: new Date(),
            status: 2
        };
        //console.log('eWallet', eWallet);
        
        //console.log('pvBalance', pvBalance)
        //console.log('ewallet', eWallet.balance)
        //console.log('ewallet_use', parseFloat(walletG.ewallet_use || 0) + parseFloat(jangPv.wallet))
        //console.log('bonus_total', parseFloat(walletG.bonus_total || 0) + parseFloat(jangPv.wallet))
        //console.log('from', walletG.id)
        await query('UPDATE customers SET pv = ?, ewallet = ?, ewallet_use = ?, bonus_total = ? WHERE id = ?',
            [pvBalance, eWallet.balance, parseFloat(walletG.ewallet_use || 0) + parseFloat(jangPv.wallet), parseFloat(walletG.bonus_total || 0) + parseFloat(jangPv.wallet), walletG.id]);

        //console.log('to_id', dataUser.id)
        //console.log('expire_date', dataUser.expire_date)
        //console.log('expire_date_bonus', dataUser.expire_date_bonus)
        await query('UPDATE customers SET expire_date = ?, expire_date_bonus = ? WHERE id = ?',
            [dataUser.expire_date, dataUser.expire_date_bonus, dataUser.id]);

        await query('INSERT INTO ewallet SET ?', [eWallet]);

        // Commit transaction
        await query('COMMIT');

        const pvData = { 
            code: codePv, 
            customer: currentUser.user_name, 
            to_customer_id : dataUser.id,
            to_customer_username : dataUser.user_name
        }
        console.log("runBonusActive", pvData);
        const runBonus = await runBonusActive(pvData);
        if (!runBonus) {
            return res.status(400).json({ error: 'รันโบนัส PV ไม่สำเร็จกรุณาทำรายการไหม่อีกครั้ง 3' });
        }

        return res.status(200).json({ success: 'เแจง PV สำเร็จ' });

    } catch (error) {
        await query('ROLLBACK');
        //console.log(error);
        return res.status(500).json({ error: error.message });
    }
};

const runBonusActive = async (pvData) => {
    const { code, customer, to_customer_id, to_customer_username } = pvData;
    try {
        console.log('start runbonus active')
        await delay(Math.floor(Math.random() * (5000 - 1000 + 1)) + 1000); 

        let codeBonus = await generateCodeBonus()
        console.log('codeBonus', codeBonus)
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

        console.log('starting for loop 7 times')
        for (let i = 1; i <= 7; i++) {
            let x = 'start';
            console.log('loop : ', i)
            const [data_users] = await query(
                'SELECT * FROM customers WHERE user_name = ?',
                [customer_username]
            );

            let data_user = data_users[0];
            
            if (!data_user) {
                if (report_bonus_active.length > 0) {
                    await query('INSERT INTO report_bonus_active SET ?', report_bonus_active[0]); // Insert only the first object
                }
                return true;
            }
            //console.log('current : ', data_user.user_name)
            console.log('user-' + i + ' : ', data_user.user_name)
            console.log('next : ', data_user.introduce_id)

            while (x === 'start') {
                if (!data_user.name || data_user.qualification_id === 'MC') {
                    //console.log('track : 262')
                    customer_username = data_user.introduce_id;

                    const [next_users] = await query(
                        'SELECT * FROM customers WHERE user_name = ?',
                        [customer_username]
                    );

                    let next_user = next_users[0];
                    if (!next_user) {
                        x = 'stop';
                        break;
                    } else {
                        data_user = next_user;
                        console.log('skip_to : ', next_user.user_name)
                        continue;
                    }
                } else {
                    console.log('start : ', data_user.user_name)
                    const qualification_id = data_user.qualification_id || 'MC';
                    let introduce_id = await query('SELECT introduce_id FROM customers WHERE user_name = ?', [jang_pv.to_customer_username])
                    //console.log('intro', introduce_id[0][0]);
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
                        code_bonus: codeBonus,
                        percen: 10
                    };
                    //console.log('bonus_active', bonus_active);

                    const wallet_total = (parseFloat(jang_pv.pv) * 10) / 100;
                    const tax_total = (wallet_total * 3) / 100;
                    //console.log('wallet_total : ', wallet_total);
                    //console.log('tax_total : ', tax_total);
                    //console.log('ewallet_old : ', data_user.ewallet);
                    //console.log('ewallet_new : ', data_user.ewallet);
                    arr_user[i] = {
                        id: data_user.id,
                        user_name: data_user.user_name,
                        lv: [i],
                        bonus_percen: 10,
                        pv: parseFloat(jang_pv.pv),
                        position: qualification_id,
                        bonus: qualification_id === 'MC' || (i >= 3 && qualification_id === 'MB') || (i >= 5 && qualification_id === 'MO' || qualification_id === 'VIP') ? 0 : wallet_total - tax_total,
                        ewallet_old: parseFloat(data_user.ewallet),
                        ewallet_new: parseFloat(data_user.ewallet) + (wallet_total - tax_total),
                        ewallet_use_old: parseFloat(data_user.ewallet_use)
                    };

                    //console.log('arr-' + i + ' : ', arr_user[i]);

                    bonus_active.tax_total = arr_user[i].bonus === 0 ? 0 : tax_total;
                    bonus_active.bonus_full = arr_user[i].bonus === 0 ? 0 : wallet_total;
                    bonus_active.bonus = arr_user[i].bonus;
                    bonus_active.ewalet_old = arr_user[i].ewallet_old;
                    bonus_active.ewalet_new = arr_user[i].ewallet_new;
                    bonus_active.ewallet_use_old = arr_user[i].ewallet_use_old;
                    bonus_active.ewallet_use_new = arr_user[i].ewallet_use_old + arr_user[i].bonus;
                    bonus_active.date_active = new Date().toISOString().slice(0, 10);
                    bonus_active.status = 'success';

                    report_bonus_active.push(bonus_active);

                    customer_username = data_user.introduce_id;

                    x = 'stop';
                    //console.log('end----------------------')
                    break;
                }
            }
        }

        if (report_bonus_active.length > 0) {
            // Insert each object in the report_bonus_active array individually
            for (const bonus of report_bonus_active) {
                await query('INSERT INTO report_bonus_active SET ?', bonus);
                //console.log('insert : ', bonus);
                //console.log('arruser : ', arr_user.filter(p => p.user_name));
                const user = arr_user.filter(p => p.user_name).find((x) => x.user_name === bonus.user_name_g);
                //console.log('user : ', user);
                if (user && bonus.ewalet_new > 0 && bonus.ewallet_use_new > 0) {
                    //console.log('user : ', user);
                    const updateCustomerQuery = `
                        UPDATE customers
                        SET ewallet = ?, ewallet_use = ?
                        WHERE user_name = ?
                    `;
                    await query(updateCustomerQuery, [bonus.ewalet_new || user.ewallet_old, bonus.ewallet_use_new || user.ewallet_use_old, user.user_name]);
                }

                const codeBonus = await generateCodeBonus();
                const eWallet = {
                    transaction_code: codeBonus,
                    customers_id_fk: user.id,
                    customer_username: user.user_name,
                    customers_id_receive: to_customer_id,
                    customers_name_receive: to_customer_username,
                    tax_total: ((user.pv * user.bonus_percen / 100) * (3/100)),
                    bonus_full: user.pv * user.bonus_percen / 100,
                    amt: user.bonus,
                    old_balance: user.ewallet_old >= 9999999.99 ? 9999999.99 : user.ewallet_old,
                    balance: bonus.ewalet_new >= 9999999.99 ? 9999999.99 : bonus.ewalet_new,
                    note_orther: 'G' + user.lv[0],
                    type: 8,
                    receive_date: new Date(),
                    receive_time: new Date(),
                    status: 2
                };

                await query('INSERT INTO ewallet SET ?', [eWallet]);
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
        await delay(Math.floor(Math.random() * (5000 - 1000 + 1)) + 1000);

        const codeBonus = await generateCodeBonus();
        console.log('codeBonus', codeBonus);
        let codePv = await generateCodePv();
        console.log('codePv', codePv);

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

        //const userActionPVOld = userAction.pv;

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
        console.log('pvBalance', pvBalance);

        let qualificationId = dataUser.qualification_id || 'MC';
        let pvUpgradTotal = parseFloat(dataUser.pv_upgrad) + pv_upgrad_input;
        let expireDate = dataUser.expire_date;
        let positionUpdate = dataUser.qualification_id;

        const updateExpireDate = () => {
            const currentDate = new Date();
            const newExpireDate = new Date(expireDate || currentDate);
            newExpireDate.setDate(newExpireDate.getDate() + 33);
            return newExpireDate.toISOString().split('T')[0];
        };

        if (qualificationId === 'MC') {
            if (pvUpgradTotal >= 20 && pvUpgradTotal < 400) {
                expireDate = updateExpireDate();
                positionUpdate = 'MB';
            } else if (pvUpgradTotal >= 400 && pvUpgradTotal < 800) {
                expireDate = updateExpireDate();
                positionUpdate = 'MO';
            } else if (pvUpgradTotal >= 800 && pvUpgradTotal < 1200) {
                expireDate = updateExpireDate();
                positionUpdate = 'VIP';
            } else if (pvUpgradTotal >= 1200) {
                expireDate = updateExpireDate();
                positionUpdate = 'VVIP';
            }
        } else if (qualificationId === 'MB') {
            if (pvUpgradTotal >= 400 && pvUpgradTotal < 800) {
                expireDate = updateExpireDate();
                positionUpdate = 'MO';
            } else if (pvUpgradTotal >= 800 && pvUpgradTotal < 1200) {
                expireDate = updateExpireDate();
                positionUpdate = 'VIP';
            } else if (pvUpgradTotal >= 1200) {
                expireDate = updateExpireDate();
                positionUpdate = 'VVIP';
            }
        } else if (qualificationId === 'MO') {
            if (pvUpgradTotal >= 800 && pvUpgradTotal < 1200) {
                expireDate = updateExpireDate();
                positionUpdate = 'VIP';
            } else if (pvUpgradTotal >= 1200) {
                expireDate = updateExpireDate();
                positionUpdate = 'VVIP';
            }
        } else if (qualificationId === 'VIP') {
            if (pvUpgradTotal >= 1200) {
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
            SET pv = ? 
            WHERE id = ?
        `;
        await query(updateUserPvQuery, [userAction.pv - pv_upgrad_input, userAction.id]);

        console.log(`userAction ${userAction.pv} --> ${userAction.pv - pv_upgrad_input}`)
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
            console.log('customerUsername-', i, ' : ', customerUsername)
            let runDataUser = runDataUsers[0];
            if (!runDataUser) {
                break;
            }

            qualificationId = runDataUser.qualification_id || 'MC';
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
                code_bonus: codeBonus,
                type: 'jangpv',
                percen: bonusPercent,
                bonus: qualificationId === 'MC' ? 0 : bonusAfterTax,
                bonus_full: walletTotal,
                tax_total: walletTotal * 0.03,
            });

            console.log('reportBonusRegister : ', i)

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

        
        const handleBonusRegisters = await handleBonusRegister(
            codeBonus, input_user_name_upgrad, userAction, dataUser, positionUpdate, pv_upgrad_input, pvUpgradTotal
        )
        
        console.log('handleBonusRegisters', handleBonusRegisters)
        //await Promise.all(handleBonusRegisters)
        
        const jangPv = {
            code: codePv,
            customer_username: userAction.user_name,
            to_customer_username: input_user_name_upgrad,
            old_position: dataUser.qualification_id,
            position: positionUpdate,
            pv_old: userAction.pv,
            pv: pv_upgrad_input,
            pv_balance: parseFloat((parseFloat(userAction.pv) - parseFloat(pv_upgrad_input)).toFixed(2)),
            type: '4',
            status: 'Success',
            type_app: 'app',
        };

        const insertJangPvQuery = `
            INSERT INTO jang_pv (code, customer_username, to_customer_username, old_position, position, pv_old, pv, pv_balance, type, status, type_app)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
            jangPv.status,
            jangPv.type_app
        ];

        await query(insertJangPvQuery, jangPvValues);

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
        await delay(Math.floor(Math.random() * (5000 - 1000 + 1)) + 1000);

        let codePv = await generateCodePv();
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
        console.log('times = ', bonusRegisters.length);
        for (let value of bonusRegisters) {
            console.log('Processing user:', value.user_name_g, 'with bonus:', value.bonus);
            
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
        
                let wallet_g_user = parseFloat(wallet_g.ewallet) || 0;
                let bonus_total = parseFloat(wallet_g.bonus_total || 0) + parseFloat(value.bonus);
                let ewallet_use = parseFloat(wallet_g.ewallet_use) || 0;
        
                let wallet_g_total = parseFloat((parseFloat(wallet_g_user) + parseFloat(value.bonus)).toFixed(2));
                let ewallet_use_total = ewallet_use + parseFloat(value.bonus);
        
                // Insert into eWallet
                const insertEWalletQuery = `
                    INSERT INTO ewallet (transaction_code, customers_id_fk, customer_username, tax_total, bonus_full, amt, old_balance, balance, type, note_orther, receive_date, receive_time, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;
                const eWalletValues = [
                    code_bonus,
                    wallet_g.id,
                    value.user_name_g,
                    parseFloat(value.tax_total),
                    parseFloat(value.bonus_full),
                    parseFloat(value.bonus),
                    wallet_g_user,
                    wallet_g_total,
                    10,
                    `โบนัสขยายธุรกิจ รหัส ${value.user_name} แนะนำรหัส ${value.regis_user_name}`,
                    new Date(),
                    new Date(),
                    2
                ];
                await query(insertEWalletQuery, eWalletValues);
                console.log('update ewallet : ', value.user_name_g, ': ', wallet_g_user, '->', wallet_g_total);
        
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
                code: codePv,
                customer_username: user_action.user_name,
                to_customer_username: input_user_name_upgrad,
                old_position: data_user.qualification_id,
                position: position_update,
                pv_old: user_action.pv,
                pv: pv_upgrad_total,
                pv_balance: pv_balance,
                type: '3',
                status: 'Success',
                type_app: 'app',
            };

            const insertJangPvQuery = `
                INSERT INTO jang_pv (code, customer_username, to_customer_username, old_position, position, pv_old, pv, pv_balance, type, status, type_app)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                jangPv.status,
                jangPv.type_app
            ];

            await query(insertJangPvQuery, jangPvValues);

            if (pv_upgrad_total >= 1200) {
                const insurance_date = new Date();
                insurance_date.setFullYear(insurance_date.getFullYear() + 1);
                const log_insurance = {
                    user_name: data_user.user_name,
                    old_exprie_date: data_user.expire_insurance_date,
                    new_exprie_date: insurance_date.toISOString().split('T')[0],
                    position: 'VVIP',
                    pv: pv_upgrad_total,
                    status: 'success',
                    type: 'jangpv'
                };
                const insertLogInsurance = `
                INSERT INTO log_insurance (user_name, old_exprie_date, new_exprie_date, position, pv, status, type)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                `;
                const logInsuranceValues = [
                    log_insurance.user_name,
                    log_insurance.old_exprie_date,
                    log_insurance.new_exprie_date,
                    log_insurance.position,
                    log_insurance.pv,
                    log_insurance.status,
                    log_insurance.type
                ];
                await query(insertLogInsurance, logInsuranceValues);

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

        await query('COMMIT');

        return { status: 200, message: `แจงอัพเกรดรหัส ${data_user.user_name} สำเร็จ` };
    } catch (error) {
        await query('ROLLBACK');
        return { status: 500, message: error.message };
    }
};

const RunBonusCashBack = async (code) => {
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    try {
        await delay(Math.floor(Math.random() * (5000 - 1000 + 1)) + 1000);

        let codeBonus = await generateCodeBonus()
        // Get the jang_pv record
        const [jangPv] = await connection.query('SELECT * FROM jang_pv WHERE code = ?', [code]);
        if (!jangPv.length) {
            await connection.rollback();
            return false;
        }

        const [dataUserG1] = await connection.query(`
            SELECT name, last_name, introduce_id, user_name, upline_id, qualification_id, expire_date
            FROM customers
            WHERE user_name = ?
        `, [jangPv[0].to_customer_username]);

        if (!dataUserG1.length) {
            await connection.rollback();
            return false;
        }

        let customerUsername = dataUserG1[0].introduce_id;
        let arrUser = [];
        let reportBonusCashback = [];

        for (let i = 1; i <= 7; i++) {
            let [dataUser] = await connection.query(`
                SELECT name, last_name, user_name, introduce_id, qualification_id, expire_date
                FROM customers
                WHERE user_name = ?
            `, [customerUsername]);

            if (i === 1) {
                var nameG1 = `${dataUser[0].name} ${dataUser[0].last_name}`;
            }

            if (!dataUser.length) {
                // Only insert if reportBonusCashback has data
                if (reportBonusCashback.length > 0) {
                    // Filter out empty entries
                    const filteredValues = reportBonusCashback.filter(data => data).map(data => [
                        data.user_name,
                        data.name,
                        data.name_g,
                        data.user_name_g,
                        data.qualification,
                        data.pv,
                        data.g,
                        data.percen,
                        data.code,
                        data.code_bonus,
                        data.bonus,
                        data.tax_total,
                        data.bonus_full
                    ]);

                    if (filteredValues.length > 0) {
                        const sql = `
                            INSERT INTO report_bonus_cashback (user_name, name, name_g, user_name_g, qualification, pv, g, percen, code, code_bonus, bonus, tax_total, bonus_full)
                            VALUES ?
                        `;

                        // Log the SQL query for debugging
                        console.log("Generated SQL Query:", sql);
                        console.log("Filtered Values:", filteredValues);

                        try {
                            // Execute the query using parameterized values
                            await connection.query(sql, [filteredValues]);
                        } catch (error) {
                            console.error("Error executing SQL query:", error.message);
                            await connection.rollback();
                            return false;
                        }
                    }
                }

                await connection.commit();
                return true;
            }

            while (true) {
                if (!dataUser[0].name) {
                    customerUsername = dataUser[0].introduce_id;
                    [dataUser] = await connection.query(`
                        SELECT name, last_name, user_name, introduce_id, qualification_id, expire_date
                        FROM customers
                        WHERE user_name = ?
                    `, [customerUsername]);
                } else {
                    const qualificationId = dataUser[0].qualification_id || 'MC';

                    reportBonusCashback[i] = {
                        user_name: jangPv[0].to_customer_username,
                        name: nameG1,
                        user_name_g: dataUser[0].user_name,
                        name_g: `${dataUser[0].name} ${dataUser[0].last_name}`,
                        code: jangPv[0].code,
                        qualification: qualificationId,
                        g: i,
                        percen: 10,
                        pv: jangPv[0].pv,
                        code_bonus: codeBonus,
                    };

                    arrUser[i] = {
                        user_name: dataUser[0].user_name,
                        lv: [i],
                        bonus_percen: 10,
                        pv: jangPv[0].pv,
                        position: qualificationId,
                    };

                    // Bonus Calculation
                    const walletTotal = jangPv[0].pv * 10 / 100;
                    let bonus = walletTotal;
                    let taxTotal = walletTotal * 3 / 100;
                    let bonusFull = walletTotal;

                    if (i <= 2 || qualificationId === 'MC') {
                        reportBonusCashback[i].tax_total = taxTotal;
                        reportBonusCashback[i].bonus_full = bonusFull;
                        reportBonusCashback[i].bonus = bonus - taxTotal;
                    } else if (i >= 3 && i <= 4) {
                        if (qualificationId === 'MC' || qualificationId === 'MB') {
                            bonus = taxTotal = bonusFull = 0;
                        } else {
                            reportBonusCashback[i].tax_total = taxTotal;
                            reportBonusCashback[i].bonus_full = bonusFull;
                            reportBonusCashback[i].bonus = bonus - taxTotal;
                        }
                    } else {
                        if (['MC', 'MB', 'MO', 'VIP'].includes(qualificationId) && [5, 6, 7].includes(i)) {
                            bonus = taxTotal = bonusFull = 0;
                        } else {
                            reportBonusCashback[i].tax_total = taxTotal;
                            reportBonusCashback[i].bonus_full = bonusFull;
                            reportBonusCashback[i].bonus = bonus - taxTotal;
                        }
                    }

                    customerUsername = dataUser[0].introduce_id;
                    break;
                }
            }
        }

        // Insert final reportBonusCashback data
        if (reportBonusCashback.length > 0) {
            // Filter out empty entries
            const filteredValues = reportBonusCashback.filter(data => data).map(data => [
                data.user_name,
                data.name,
                data.name_g,
                data.user_name_g,
                data.qualification,
                data.pv,
                data.g,
                data.percen,
                data.code,
                data.code_bonus,
                data.bonus,
                data.tax_total,
                data.bonus_full
            ]);

            if (filteredValues.length > 0) {
                const sql = `
                    INSERT INTO report_bonus_cashback (user_name, name, name_g, user_name_g, qualification, pv, g, percen, code, code_bonus, bonus, tax_total, bonus_full)
                    VALUES ?
                `;

                // Log the SQL query for debugging
                //console.log("Generated SQL Query:", sql);
                //console.log("Filtered Values:", filteredValues);

                try {
                    // Execute the query using parameterized values
                    await connection.query(sql, [filteredValues]);
                } catch (error) {
                    //console.error("Error executing SQL query:", error.message);
                    await connection.rollback();
                    return false;
                }
            }
        }

        await connection.commit();
        return true;
    } catch (error) {
        console.error("Transaction error:", error.message);
        await connection.rollback();
        return false;
    } finally {
        connection.release();
    }
};



exports.jangPvCashBack = async (req, res) => {
    const { active_user_name, active_user_id, user_name, pv, type } = req.body;
    await delay(Math.floor(Math.random() * (5000 - 1000 + 1)) + 1000);
    let codeBonus = await generateCodeBonus();
    if (type == 2) {
        if (pv <= 0) {
            return res.status(400).send('ไม่สามารถแจง 0 PV ได้');
        }

        const activeUserQuery = `
            SELECT id, user_name, name, last_name, pv, qualification_id, ewallet, ewallet_use 
            FROM customers 
            WHERE user_name = ?
        `;
        const [activeUsers] = await query(activeUserQuery, [active_user_name]);
        const activeUser = activeUsers[0];

        if (!activeUser) {
            return res.status(404).send('ไม่มี User ' + active_user_name + 'ในระบบ');
        }

        const userQuery = `
            SELECT id, user_name, name, last_name, pv, qualification_id, ewallet, ewallet_use 
            FROM customers 
            WHERE user_name = ?
        `;
        const [users] = await query(userQuery, [user_name]);
        const user = users[0];

        if (!user) {
            return res.status(404).send('ไม่มี User ' + user_name + 'ในระบบ');
        }

        if (pv > activeUser.pv) {
            return res.status(400).json({
                message: 'PV ไม่พอสำหรับการแจง',
                //user: user,
                user_pv: activeUser.pv,
                pv: pv
            });
        }

        const customerUpdateQuery = `
            SELECT * FROM customers 
            WHERE id = ? FOR UPDATE
        `;
        const [customerUpdates] = await query(customerUpdateQuery, [user.id]);
        const customerUpdate = customerUpdates[0];

        const code = codeBonus;  // Replace with your code generation logic

        const bonusPercenQuery = `
            SELECT bonus_jang_pv 
            FROM dataset_qualification 
            WHERE code = ?
        `;
        const [bonusPercens] = await query(bonusPercenQuery, [user.qualification_id]);
        const bonusPercen = bonusPercens[0]?.bonus_jang_pv;

        const pvBalance = parseFloat(activeUser.pv) - pv;
        const pvToPrice = pv * parseFloat(bonusPercen) / 100;
        const pvToPriceTax = pvToPrice - (pvToPrice * 3 / 100);

        const ewalletUser = parseFloat(user.ewallet) || 0;
        const ewalletUse = parseFloat(customerUpdate.ewallet_use) || 0;
        const walletBalance = ewalletUser + pvToPriceTax;

        const jangPv = {
            code,
            customer_username: active_user_name, // Assuming you have a user object from authentication
            to_customer_username: user_name,
            position: user.qualification_id,
            bonus_percen: parseFloat(bonusPercen),
            pv_old: parseFloat(user.pv),
            pv,
            pv_balance: pvBalance,
            wallet: pvToPriceTax,
            old_wallet: ewalletUser,
            wallet_balance: walletBalance,
            note_orther: '',
            type: '2',
            status: 'Success',
            type_app: 'app'
        };

        if (parseFloat(user.pv_upgrad) >= 1200) {
            customerUpdate.pv_upgrad = parseFloat(customerUpdate.pv_upgrad) + pv;
        }

        //customerUpdate.pv = pvBalance;
        customerUpdate.ewallet = ewalletUser + pvToPriceTax;
        customerUpdate.ewallet_use = ewalletUse + pvToPriceTax;

        const eWallet = {
            transaction_code: code,
            customers_id_fk: active_user_id,
            customer_username: active_user_name,
            customers_id_receive: user.id,
            customers_name_receive: user.user_name,
            tax_total: pvToPrice * 3 / 100,
            bonus_full: pvToPrice,
            amt: pvToPriceTax,
            old_balance: ewalletUser,
            balance: walletBalance,
            type: 5,
            receive_date: new Date(),
            receive_time: new Date(),
            status: 2
        };

        try {
            await query('BEGIN');

            const checkJangPvQuery = `
                SELECT * FROM jang_pv WHERE code = ?
            `;
            const [checkJangPv] = await query(checkJangPvQuery, [code]);
            //console.log('checkJangPv', checkJangPv);
            if (checkJangPv.length) {
                await query('ROLLBACK');
                return res.status(400).send('แจง PV ไม่สำเร็จกรุณาทำรายการไหม่อีกครั้ง');
            }

            await query('UPDATE customers SET ? WHERE id = ?', [customerUpdate, customerUpdate.id]);
            await query('UPDATE customers SET pv = ? WHERE id = ?', [pvBalance, activeUser.id]);
            await query('INSERT INTO jang_pv SET ?', jangPv);
            await query('INSERT INTO ewallet SET ?', eWallet);

            const runBonusCashBack = await RunBonusCashBack(code); // Implement this function based on the PHP code
            //console.log('code', code);
            if (runBonusCashBack) {
                const reportBonusCashbackQuery = `
                    SELECT * FROM report_bonus_cashback WHERE code = ?
                `;
                const [reportBonusCashback] = await query(reportBonusCashbackQuery, [code]);
                //console.log('reportBonusCashback', reportBonusCashback);
                for (const value of reportBonusCashback) {
                    //console.log('value', value);
                    if (parseFloat(value.bonus) > 0) {
                        const walletGQuery = `
                            SELECT id, user_name, ewallet, ewallet_use, bonus_total 
                            FROM customers 
                            WHERE user_name = ?
                            FOR UPDATE
                        `;
                        const [walletGs] = await query(walletGQuery, [value.user_name_g]);
                        const walletG = walletGs[0];

                        const walletGUser = parseFloat(walletG.ewallet) || 0;
                        const ewalletUseTotal = parseFloat(walletG.ewallet_use) || 0;
                        const walletGTotal = walletGUser + parseFloat(value.bonus);
                        const eWalletCashBack = {
                            transaction_code: value.code_bonus,
                            customers_id_fk: walletG.id,
                            customer_username: value.user_name_g,
                            customers_id_receive: user.id,
                            customers_name_receive: user.user_name,
                            tax_total: value.tax_total,
                            bonus_full: value.bonus_full,
                            amt: value.bonus,
                            old_balance: walletGUser,
                            balance: walletGTotal,
                            type: 6,
                            note_orther: 'G' + value.g,
                            receive_date: new Date(),
                            receive_time: new Date(),
                            status: 2
                        };

                        await query('INSERT INTO ewallet SET ?', eWalletCashBack);

                        await query('UPDATE customers SET ewallet = ?, ewallet_use = ? WHERE id = ?', 
                            [walletGTotal, ewalletUseTotal + parseFloat(value.bonus), walletG.id]);

                        await query('UPDATE report_bonus_cashback SET status = "success", date_active = NOW() WHERE id = ?', 
                            [value.id]);
                    }
                }
            }

            await query('COMMIT');
            return res.status(200).json({
                message: 'success',
                status: true
            });
        } catch (error) {
            await query('ROLLBACK');
            console.log(error)
            return res.status(500).send(error.message);
        }
    } else {
        return res.status(400).send('เงื่อนไขการแจง PV ไม่ถูกต้อง');
    }
};

exports.pvTransfer = async (req, res) => {
    const { from_username, pv_transfer, to_username } = req.body;
    try {
        if (parseFloat(pv_transfer) <= 0) {
            return res.status(400).send('จํานวน PV ต้องมากกว่า 0');
        }
        await query('BEGIN');
        await delay(Math.floor(Math.random() * (5000 - 1000 + 1)) + 1000);
        let codePv = await generateCodePv();

        const [from_users] = await query('SELECT * FROM customers WHERE user_name = ?', [from_username]);
        const from_user = from_users[0]
        const from_balancePV = parseFloat((from_user.pv || 0)) - parseFloat(pv_transfer);
        
        const [to_users] = await query('SELECT * FROM customers WHERE user_name = ?', [to_username]);
        const to_user = to_users[0]
        const to_balancePV = parseFloat((to_user.pv || 0)) + parseFloat(pv_transfer);
        
        const jangPv = {
            code: codePv,
            customer_username: from_username,
            customer_username_transfer: from_username,
            to_customer_username: to_username,
            pv_old: parseFloat(from_user.pv),
            pv_old_recive: parseFloat(to_user.pv),
            pv: pv_transfer,
            pv_balance: from_balancePV,
            pv_balance_recive: to_balancePV,
            type: '6',
            status: 'Success',
            type_app: 'app',
        };

        await query('UPDATE customers SET pv = ? WHERE user_name = ?', [ from_balancePV , from_username]);
        await query('UPDATE customers SET pv = ? WHERE user_name = ?', [ to_balancePV , to_username]);
        await query('INSERT INTO jang_pv (`code`, `customer_username`, `customers_username_tranfer`, `to_customer_username`, `pv_old`, `pv_old_recive`, `pv`, `pv_balance`, `pv_balance_recive`, `type`, `status`, `type_app`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
            jangPv.code,
            jangPv.customer_username,
            jangPv.customer_username_transfer,
            jangPv.to_customer_username,
            jangPv.pv_old,
            jangPv.pv_old_recive,
            jangPv.pv,
            jangPv.pv_balance,
            jangPv.pv_balance_recive,
            jangPv.type,
            jangPv.status,
            jangPv.type_app
        ]);
        
        
        await query('COMMIT');
        return res.status(200).json({
            message: 'success',
            status: true
        });

    } catch (error) {
        await query('ROLLBACK');
        console.log(error);
        return res.status(500).send(error.message);
    }
};

exports.ewalletTransfer = async (req, res) => {
    const { from_username, ewallet_transfer, to_username } = req.body;
    try {
        if (parseFloat(ewallet_transfer) <= 0) {
            return res.status(400).send('จํานวนเงินต้องมากกว่า 0');
        }
        await query('BEGIN');
        await delay(Math.floor(Math.random() * (5000 - 1000 + 1)) + 1000);
        let codeWallet = generateCode(10);

        const [from_users] = await query('SELECT * FROM customers WHERE user_name = ?', [from_username]);
        const from_user = from_users[0]
        const from_balanceEwallet = parseFloat((from_user.ewallet || 0)) - parseFloat(ewallet_transfer);
        
        const [to_users] = await query('SELECT * FROM customers WHERE user_name = ?', [to_username]);
        const to_user = to_users[0]
        const to_balanceEwallet = parseFloat((to_user.ewallet || 0)) + parseFloat(ewallet_transfer);
        
        const ewallet_1 = {
            transaction_code: codeWallet,
            customers_id_fk: from_user.id,
            customer_username: from_username,
            customers_id_tranfer: from_user.id,
            customers_username_tranfer: from_username,
            amt: ewallet_transfer,
            customers_id_receive: to_user.id,
            customers_name_receive: to_username,
            type: "2",
            type_tranfer: "1",
            status: "2",
            old_balance: parseFloat(from_user.ewallet || 0),
            balance: from_balanceEwallet,
            balance_recive: to_balanceEwallet,
            receive_date: new Date(),
            receive_time: new Date(),
        };
        //console.log(ewallet_1)

        const ewallet_2 = {
            transaction_code: codeWallet,
            customers_id_fk: to_user.id,
            customer_username: to_username,
            customers_id_tranfer: from_user.id,
            customers_username_tranfer: from_username,
            amt: ewallet_transfer,
            customers_id_receive: to_user.id,
            customers_name_receive: to_username,
            type: "2",
            type_tranfer: "2",
            status: "2",
            old_balance: parseFloat(to_user.ewallet || 0),
            balance: to_balanceEwallet,
            balance_recive: to_balanceEwallet,
            receive_date: new Date(),
            receive_time: new Date(),
        };

        await query('UPDATE customers SET ewallet = ? WHERE user_name = ?', [ from_balanceEwallet , from_username]);
        await query('UPDATE customers SET ewallet = ? WHERE user_name = ?', [ to_balanceEwallet , to_username]);

        await query(
            `INSERT INTO ewallet 
            (transaction_code, customers_id_fk, customer_username, customers_id_tranfer, 
            customers_username_tranfer, amt, customers_id_receive, customers_name_receive, 
            type, type_tranfer, status, old_balance, balance, balance_recive) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                ewallet_1.transaction_code,
                ewallet_1.customers_id_fk,
                ewallet_1.customer_username,
                ewallet_1.customers_id_tranfer,
                ewallet_1.customers_username_tranfer,
                ewallet_1.amt,
                ewallet_1.customers_id_receive,
                ewallet_1.customers_name_receive,
                ewallet_1.type,
                ewallet_1.type_tranfer,
                ewallet_1.status,
                ewallet_1.old_balance,
                ewallet_1.balance,
                ewallet_1.balance_recive,
            ]
        );
        
        await query(
            `INSERT INTO ewallet 
            (transaction_code, customers_id_fk, customer_username, customers_id_tranfer, 
            customers_username_tranfer, amt, customers_id_receive, customers_name_receive, 
            type, type_tranfer, status, old_balance, balance, balance_recive) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                ewallet_2.transaction_code,
                ewallet_2.customers_id_fk,
                ewallet_2.customer_username,
                ewallet_2.customers_id_tranfer,
                ewallet_2.customers_username_tranfer,
                ewallet_2.amt,
                ewallet_2.customers_id_receive,
                ewallet_2.customers_name_receive,
                ewallet_2.type,
                ewallet_2.type_tranfer,
                ewallet_2.status,
                ewallet_2.old_balance,
                ewallet_2.balance,
                ewallet_2.balance_recive,
            ]
        );
        
        await query('COMMIT');
        return res.status(200).json({
            message: 'success',
            status: true
        });

    } catch (error) {
        await query('ROLLBACK');
        console.log(error);
        return res.status(500).send(error.message);
    }
};