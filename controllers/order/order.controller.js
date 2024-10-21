const { Order } = require("../../models/order/order.schema");
const { PartnerProduct } = require("../../models/product/product.schema");
const { Partner } = require("../../models/partner/partner.schema");
const pool = require('../../mysql_db');
const dayjs = require("dayjs");
const axios = require('axios');
const buddhistEra = require("dayjs/plugin/buddhistEra");
dayjs.extend(buddhistEra);
dayjs.locale("th");

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const query = (sql, params) => {
    return pool.query(sql, params);
};

const generateOrderCode = async () => {
    const orders = await Order.find();
    const prefix = "PMO"
    const curdate = dayjs().format("BBMMDD");
    const orderLength = orders.length + 1
    let code = `${prefix}${curdate}-${orderLength.toString().padStart(6, "0")}`;
    return code
}

function generateCode(length) {
    return Math.random().toString(36).substring(2, 2 + length).toUpperCase();
}

async function generateCodeBonus() {
    try {
        const {data} = await axios.get('https://golf4.orangeworkshop.info/mlm/api/db_code_bonus/2')
        //const {data} = await axios.get('https://maruayduaykan.com/api/db_code_bonus/2')
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
        const {data} = await axios.get('https://golf4.orangeworkshop.info/mlm/api/db_code_pv')
        //const {data} = await axios.get('https://maruayduaykan.com/api/db_code_pv')
        if (data) return data
        else return generateCode(6)
    }
    catch(err) {
        //console.log(err)
        return generateCode(6)
    }
}

const runUserWallet = async ({user_id, amount, code, order_pv, codeBonus}) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const customerId = user_id;
        
        if (!customerId) {
            return false;
        }

        const [customers] = await connection.query('SELECT * FROM customers WHERE id = ?', [customerId]);
        if (customers.length === 0) {
            return false;
        }
        const customer = customers[0];
        const userAction = customers[0];
        const wallet = parseFloat(customer.ewallet || 0);
        const newWallet = wallet - amount;
        let pv_upgrad_input = order_pv
        let input_user_name_upgrad = userAction.user_name

        let date = new Date();
        date.setHours(date.getHours() + 7);

        // run bonus ---------------------------------------------------
        let reportBonusRegister = [];
        let customerUsername = customer.introduce_id;
        let qualificationId = customer.qualification_id || 'MC';

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
                regis_user_introduce_id: userAction.introduce_id,
                regis_name: `${userAction.name} ${userAction.last_name}`,
                user_name_g: runDataUser.user_name,
                old_position: userAction.qualification_id,
                new_position: userAction.qualification_id,
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
        
        const fastStarted = await runBonusFaststart(
            codeBonus, input_user_name_upgrad, userAction, userAction, userAction.qualification_id , userAction.pv, pv_upgrad_input
        )

        if (!fastStarted) {
            return false
        }
        
        let codePv = await generateCodePv();
        let bonusPercent = 0;
        if (parseFloat(userAction.pv_upgrad)>= 1200) {
            bonusPercent = 50;
        } else {
            bonusPercent = 30;
        }
        const jangPv = {
            code: codePv,
            code_order: code,
            customer_username: userAction.user_name,
            to_customer_username: input_user_name_upgrad,
            old_position: userAction.qualification_id,
            position: userAction.qualification_id,
            bonus_percen: bonusPercent,
            pv_old: userAction.pv,
            pv: pv_upgrad_input,
            pv_balance: userAction.pv,
            wallet: amount,
            old_wallet: userAction.ewallet,
            wallet_balance: newWallet,
            note_orther: 'สั่งซื้อสินค้าพาร์ทเนอร์',
            type: '5',
            status: 'Success',
            type_app: 'app',
        };

        const insertJangPvQuery = `
            INSERT INTO jang_pv (code, code_order, customer_username, to_customer_username, old_position, position, bonus_percen, pv_old, pv, pv_balance, wallet, old_wallet, wallet_balance, note_orther, type, status, type_app)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
        const jangPvValues = [
            jangPv.code,
            jangPv.code_order,
            jangPv.customer_username,
            jangPv.to_customer_username,
            jangPv.old_position,
            jangPv.position,
            jangPv.bonus_percen,
            jangPv.pv_old,
            jangPv.pv,
            jangPv.pv_balance,
            jangPv.wallet,
            jangPv.old_wallet,
            jangPv.wallet_balance,
            jangPv.note_orther,
            jangPv.type,
            jangPv.status,
            jangPv.type_app
        ];

        await query(insertJangPvQuery, jangPvValues);

        return true
    } catch (err) {
        console.log(err);
        return false
    } finally {
        if (connection) connection.release();
    }
};

const useUserWallet = async ({user_id, amount, code}) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const customerId = user_id;
        
        if (!customerId) {
            return false;
        }

        const [customers] = await connection.query('SELECT * FROM customers WHERE id = ?', [customerId]);
        if (customers.length === 0) {
            return false;
        }
        const customer = customers[0];
        const wallet = parseFloat(customer.ewallet || 0);
        const newWallet = wallet - amount;

        let date = new Date();
        date.setHours(date.getHours() + 7);

        const updatedUserEwallet = await connection.query('UPDATE customers SET ewallet = ? WHERE id = ?', [newWallet, customerId]);
        const updatedEwalletLog = await connection.query(
            `INSERT INTO ewallet (transaction_code, customers_id_fk, customer_username, amt, type, note_orther, status, old_balance, balance, receive_date, receive_time) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
            [code, customerId, customer.user_name, amount, 4, 'สั่งซื้อสินค้าพาร์ทเนอร์', 1, wallet, newWallet, new Date(), date]
        );
        if (!updatedUserEwallet.length || !updatedEwalletLog.length) {
            return false;
        }

        return true
    } catch (err) {
        console.log(err);
        return false
    } finally {
        if (connection) connection.release();
    }
};

const claimShopWallet = async ({user_name, amount, code}) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const customerUsername = user_name;
        
        if (!customerUsername) {
            return false;
        }

        const [customers] = await connection.query('SELECT * FROM customers WHERE user_name = ?', [customerUsername]);
        if (customers.length === 0) {
            return false;
        }
        const customer = customers[0];
        const wallet = parseFloat(customer.ewallet || 0);
        const newWallet = wallet + amount;

        let date = new Date();
        date.setHours(date.getHours() + 7);

        const updatedUserEwallet = await connection.query('UPDATE customers SET ewallet = ? WHERE user_name = ?', [newWallet, customerUsername]);
        
        const updatedEwalletLog = await connection.query(
            `INSERT INTO ewallet (transaction_code, customers_id_fk, customer_username, amt, type, note_orther, status, old_balance, balance, receive_date, receive_time) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
            [code, customerUsername, customer.user_name, amount, 4, 'รับค่าสินค้าพาร์ทเนอร์', 2, wallet, newWallet, new Date(), date]
        );
        if (!updatedUserEwallet.length || !updatedEwalletLog.length) {
            return false;
        }

        return true
    } catch (err) {
        console.log(err);
        return false
    } finally {
        if (connection) connection.release();
    }
};

const updateEwalletStatus = async (transaction_code) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const updatedEwalletLog = await connection.query('UPDATE ewallet SET status = 2 WHERE transaction_code = ?', [transaction_code]);
        if (!updatedEwalletLog.length) {
            return false
        }
        return true
    } catch (err) {
        console.log(err);
        return false
    } finally {
        if (connection) connection.release();
    }
}

const runBonusFaststart = async (code_bonus, input_user_name_upgrad, user_action, data_user, position_update, pv_balance, pv_upgrad_total) => {
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
                    `โบนัสซื้อสินค้าพาร์ทเนอร์ รหัส ${value.user_name}`,
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
        /*if (position_update === 'VVIP') {
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
            const newPvUpgrade = parseFloat(data_user.pv_upgrad || 0) + parseFloat(pv_upgrad_total || 0);
            await query(`
                UPDATE customers
                SET pv_upgrad = ?
                WHERE user_name = ?
            `, [newPvUpgrade, data_user.user_name]);
        }*/

        await query('COMMIT');

        return codePv;
    } catch (error) {
        await query('ROLLBACK');
        return false;
    }
};

exports.createOrderPartner = async (req, res) => {
    const {
        buyer_id,
        buyer_username,
        shop_id,
        //shop_username,
        line_product,
        total_qty,
        total_product_price,
        total_discount,
        bill_discount,
        transfer_method,
        //tracking_no,
        delivery_provider,
        delivery_price,
        vat_percent,
        vat_price,
        //withholding_percent,
        //withholding_price,
        net_price,
        total_pv,
        status,
        to_address,
    } = req.body
    try {
        await delay(Math.floor(Math.random() * (5000 - 1000 + 1)) + 1000);
        const code = await generateOrderCode();
        //const codeBonus = await generateCodeBonus();
        const existShop = await Partner.findById(shop_id)
        if (!existShop) {
            return res.status(404).json({ message: "Shop not found", status: false })
        }
        const shop_username = existShop.customer_username
        let total_commission = 0

        const products = await Promise.all(line_product.map(async(product) => {
            const prod = await PartnerProduct.findById(product.product_id)
            total_commission += (prod.commission || 0) * (product.product_qty || 1)
            return {
                ...product,
                commission: (prod.commission || 0) * (product.product_qty || 1)
            }
        }))

        let total_income = net_price - total_commission

        const newOrder = new Order({
            code,
            buyer_id,
            buyer_username,
            shop_id,
            shop_username,
            line_product: products,
            total_qty,
            total_product_price,
            total_discount,
            bill_discount,
            transfer_method,
            //tracking_no,
            delivery_provider,
            delivery_price,
            vat_percent,
            vat_price,
            //withholding_percent,
            //withholding_price,
            net_price,
            status,
            to_address,
            total_pv,
            total_commission,
            total_income
        })
        /* const useWallet = await useUserWallet({user_id: buyer_id, amount: net_price, code: code, order_pv: total_pv, codeBonus: codeBonus})
        if (!useWallet) {
            return res.status(500).json({ message: "Can't use user wallet", status: false })
        } */

        const useWallet = await useUserWallet({user_id: buyer_id, amount: net_price, code: code.replace('PMO', 'PNB')})
        if (!useWallet) {
            return res.status(500).json({ message: "Can't use user wallet", status: false })
        }

        const savedOrder = await newOrder.save();
        return res.status(200).json({ message: "success", data: savedOrder, status: true })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({ message: err.message })
    }
}

exports.updateOrderPartner = async (req, res) => {
    const {
        //buyer_id,
        //buyer_username,
        //shop_id,
        //shop_username,
        total_pv,
        line_product,
        total_qty,
        total_product_price,
        total_discount,
        bill_discount,
        transfer_method,
        tracking_no,
        delivery_provider,
        delivery_price,
        vat_percent,
        vat_price,
        withholding_percent,
        withholding_price,
        net_price,
        status,
        to_address,
    } = req.body
    const { id } = req.params
    try {
        const existOrder = await Order.findById(id)
        if(!existOrder) return res.status(404).json({ message: "Order not found", status: false })
        if (status === 1) {
            await Promise.all(existOrder.line_product.map(async(product) => {
                const prod = await PartnerProduct.findById(product.product_id)
                await PartnerProduct.findByIdAndUpdate(product.product_id, {
                    stock: ((prod.stock) - (product.product_qty || 1)) || prod.stock,
                    sold: ((prod.sold || 0) + (product.product_qty || 1)) || prod.sold
                }, { new:true })
            }))
        }

        if (status === 5 && existOrder.status === 2) {
            const codeBonus = existOrder.code.replace('PMO', 'PNU');
            const runWallet = await runUserWallet({user_id: existOrder.buyer_id, amount: existOrder.net_price, code: existOrder.code, order_pv: existOrder.total_pv, codeBonus: codeBonus})
            if (!runWallet) {
                return res.status(500).json({ message: "Can't run wallet", status: false })
            }

            const claimWallet = await claimShopWallet({user_name: existOrder.shop_username, amount: existOrder.total_income, code: existOrder.code.replace('PMO', 'PNS')})
            if (!claimWallet) {
                return res.status(500).json({ message: "Can't claim wallet", status: false })
            }

            const updateEwallet = await updateEwalletStatus(existOrder.code.replace('PMO', 'PNB'))
            if (!updateEwallet) {
                return res.status(500).json({ message: "Can't update ewallet status", status: false })
            }
        }

        const updatedOrder = await Order.findByIdAndUpdate( id, {
            //code,
            //buyer_id,
            //buyer_username,
            //shop_id,
            //shop_username,
            line_product: line_product || existOrder.line_product,
            total_qty: total_qty || existOrder.total_qty,
            total_product_price: total_product_price || existOrder.total_product_price,
            total_discount: total_discount || existOrder.total_discount,
            bill_discount: bill_discount || existOrder.bill_discount,
            transfer_method: transfer_method || existOrder.transfer_method,
            tracking_no: tracking_no || existOrder.tracking_no,
            delivery_provider: delivery_provider || existOrder.delivery_provider,
            delivery_price: delivery_price || existOrder.delivery_price,
            vat_percent: vat_percent || existOrder.vat_percent,
            vat_price: vat_price || existOrder.vat_price,
            withholding_percent: withholding_percent || existOrder.withholding_percent,
            withholding_price: withholding_price || existOrder.withholding_price,
            net_price: net_price || existOrder.net_price,
            status: status || existOrder.status,
            to_address: to_address || existOrder.to_address,
            total_pv: total_pv || existOrder.total_pv
        }, { new: true })
        return res.status(200).json({ message: "success", data: updatedOrder, status: true })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({ message: err.message })
    }
}

exports.getUserOrdersPartner = async (req, res) => {
    const { username } = req.body
    try {
        const orders = await Order.find({ buyer_username: username });
        return res.status(200).json({ message: "success", data: orders, status: true })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({ message: err.message })
    }
}

exports.getShopOrdersPartner = async (req, res) => {
    const { username } = req.body
    try {
        const orders = await Order.find({ shop_username: username });
        return res.status(200).json({ message: "success", data: orders, status: true })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({ message: err.message })
    }
}

exports.getUserOrderPartner = async (req, res) => {
    const { id } = req.params
    try {
        const order = await Order.findById(id);
        return res.status(200).json({ message: "success", data: order, status: true })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({ message: err.message })
    }
}

exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find();
        const formatOrders = orders.map(async(order) => {
            const _shop = await Partner.findById(order.shop_id).select("-__v -createdAt -updatedAt")
            return {
                ...order._doc,
                _shop: _shop
            }
        })
        const promisedOrders = await Promise.all(formatOrders)
        return res.status(200).json({ message: "success", data: promisedOrders, status: true })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({ message: err.message })
    }
}
