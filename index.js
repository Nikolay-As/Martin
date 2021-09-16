const express = require('express')
const app = express()
const port = 3000||process.env.port

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

const {Telegraf,session,Scenes:{BaseScene,Stage},Markup}=require('telegraf')

const bot_token=require( './botinfo')  // получаем токен бота

//console.log("AgACAgIAAxkBAAIBu2FCHXuyta-AFMfza5T95BRwmhewAAI3uDEb3bwQSoPZNOas0PWsAQADAgADcwADIAQ")
const mysql = require("mysql2");
  
const pool = mysql.createPool({
    host: 'nikolayhs.beget.tech',
    user: 'nikolayhs_bot',
    database: 'nikolayhs_bot',
    password:'Nikolayhs_bot',
  });

  const id_vlad='846809274'
  const id_kolya='841304292'

const remove_keyboard=Markup.removeKeyboard()
const menu_keyboard=Markup.keyboard(['💸Оставить заявку на оплату',
                                    '💻Оставить заявку на изменение/добавление MAC-адресов',
                                    '👀Проверить статус заявки',
                                    '📋Инструкции',
                                    '🚨Пнуть админа,чтобы обработал заявку🤬']).oneTime() // общее меню бота






// Сцена, для заявки на оплату -------- ( номер комнаты)
const PaymentScene_1=new BaseScene('PaymentScene_1')
PaymentScene_1.enter(ctx=>ctx.reply('Напиши номер комнаты',remove_keyboard))
PaymentScene_1.on('text',ctx=>{
    ctx.session.number_room=ctx.message.text
    return ctx.scene.enter('PaymentScene_2') // Переходи в сцену PaymentScene_2
})
// ------------------

// Сцена, для заявки на оплату -------- ( Фамилилия на которую зареган инет )
const PaymentScene_2=new BaseScene('PaymentScene_2')
PaymentScene_2.enter(ctx=>ctx.reply('Напиши фамилию на которую зарегестрировал сеть'))
PaymentScene_2.on('text',ctx=>{
    ctx.session.fio=ctx.message.text
    return ctx.scene.enter('PaymentScene_3') // Переходи в сцену PaymentScene_3
})
// ------------------

// Сцена, для заявки на оплату -------- ( Скрин оплаты инет )
const PaymentScene_3=new BaseScene('PaymentScene_3')
PaymentScene_3.enter(ctx=>ctx.reply('Отправь скрин платежа'))
 PaymentScene_3.on('photo',ctx=>{
    ctx.session.foto=ctx.message.photo[0].file_id
    ctx.reply(`Заявка принята`,menu_keyboard)
   // ctx.reply(`Содержание вашей заявки:\n- №комнаты:${ctx.session.number_room}\n- ФИО:${ctx.session.fio}\n- Скрин:`);
    return ctx.scene.leave()
})
PaymentScene_3.leave(ctx=>{
   
    let getHours=new Date().getHours() // Определяем время заявки
    let getMinutes=new Date().getMinutes();
    let getSeconds=new Date().getSeconds();
    let time=getHours+':'+getMinutes+':'+getSeconds;


    let year=new Date().getFullYear(); // Определяем Дату заявки
    let mounth=new Date().getMonth();
    let day=new Date().getDay();
    let date=year+'-'+mounth+'-'+day;
    

    const data=[ctx.from.id,'Оплата',ctx.session.number_room,ctx.session.fio,ctx.session.foto,date,time]; // Формируем структуру данных для записи в БД
   const sql = "INSERT INTO applications(id_user,type,  room_number,fio_user,file_id,date,time) VALUES(?,?,?,?,?,?,?)";
   pool.query(sql, data   , function(err, results) {
    if(err) console.log(err);
    else {
        console.log(results.insertId)
        ctx.reply(`Номер вашей заявки : ${results.insertId}`)
        bot.telegram.sendMessage(id_kolya,`Поступила заявка на оплату от (${ctx.session.fio}) комната (${ctx.session.number_room})`)
        bot.telegram.sendMessage(id_vlad,`Поступила заявка на оплату от (${ctx.session.fio}) комната (${ctx.session.number_room})`)
    }

});

})
// ------------------







// Сцена, для добавление/изменения списка устройств -------- ( номер комнаты)
const Add_change_mac_1=new BaseScene('Add_change_mac_1')
Add_change_mac_1.enter(ctx=>ctx.reply('Напиши номер комнаты',remove_keyboard))
Add_change_mac_1.on('text',ctx=>{
    ctx.session.number_room=ctx.message.text
    return ctx.scene.enter('Add_change_mac_2') // Переходи в сцену Add_change_mac_2
})
// ------------------

// Сцена, для добавление/изменения списка устройств -------- (Спрашиваем фамилию на которую зарегестрирована сеть)
const Add_change_mac_2=new BaseScene('Add_change_mac_2')
Add_change_mac_2.enter(ctx=>ctx.reply('Напиши фамилию на которую зарегестрировал сеть.',remove_keyboard))
Add_change_mac_2.on('text',ctx=>{
    ctx.session.fio=ctx.message.text
    return ctx.scene.enter('Add_change_mac_3') // Переходи в сцену Add_change_mac_3
})
// ------------------

// Сцена, для добавление/изменения списка устройств -------- (Спрашиваем сколько устройств всего должно быть подключено)
const Add_change_mac_3=new BaseScene('Add_change_mac_3')
Add_change_mac_3.enter(ctx=>ctx.reply('Напиши Mac-адреса, всех устройств(через пробел), которые должны быть подключены.',remove_keyboard))
Add_change_mac_3.on('text',ctx=>{
    ctx.session.mac=ctx.message.text
    ctx.reply(`Заявка принята`,menu_keyboard)
    return ctx.scene.leave()
})

Add_change_mac_3.leave(ctx=>{
    let getHours=new Date().getHours() // Определяем время заявки
    let getMinutes=new Date().getMinutes();
    let getSeconds=new Date().getSeconds();
    let time=getHours+':'+getMinutes+':'+getSeconds;


    let year=new Date().getFullYear(); // Определяем Дату заявки
    let mounth=new Date().getMonth();
    let day=new Date().getDay();
    let date=year+'-'+mounth+'-'+day;

    const data=[ctx.from.id,'MAC',ctx.session.number_room,ctx.session.fio,ctx.session.mac,date,time]; // Формируем структуру данных для записи в БД
    const sql = "INSERT INTO applications(id_user,type,  room_number,fio_user,comment,date,time) VALUES(?,?,?,?,?,?,?)";
    pool.query(sql, data   , function(err, results) {
     if(err) console.log(err);
     else {
         console.log(results.insertId)
         ctx.reply(`Номер вашей заявки : ${results.insertId}`)
         bot.telegram.sendMessage(id_kolya,`Поступила заявка на добавление/удаление MAC-ов от  (${ctx.session.fio}) комната (${ctx.session.number_room})`)
         bot.telegram.sendMessage(id_vlad,`Поступила заявка на добавление/удаление MAC-ов от (${ctx.session.fio}) комната (${ctx.session.number_room})`)
     }
 
 });
    

})
// ------------------





// Сцена, для проверки статуса заявки -------- ( номер заявки )
const Check_status_1=new BaseScene('Check_status_1')
Check_status_1.enter(ctx=>ctx.reply('Напиши номер заявки',remove_keyboard))
Check_status_1.on('text',ctx=>{
    ctx.session.number_app=Number(ctx.message.text)
    ctx.reply(`Проверяю...`,menu_keyboard)
    return ctx.scene.leave()
})
Check_status_1.leave(ctx=>{
    const data=[ctx.session.number_app,ctx.from.id];
    const sql='SELECT type,status FROM applications WHERE id=? AND id_user=?'
    pool.query(sql, data   , function(err, results) {
        if(err) console.log(err);
        else {
            if(results.length==0){
                ctx.reply('Такой заявки нет,либо не вы создавали ее ( только автор заявки может посмотреть ее статус )')
            }else {
                ctx.reply(`Тип заявки: ${results[0].type}\nСтатус заявки: ${results[0].status}`)
            }
        }
    
    });
})
// ------------------



// Сцена, Пнуть админа -------- ( Пинаем )
const Kick_1=new BaseScene('Kick_1')
Kick_1.enter(ctx=>{
    ctx.reply(`🦿Пнул админов!🤬`,menu_keyboard)
    return ctx.scene.leave()
})
Kick_1.leave(ctx=>{
    bot.telegram.sendMessage(id_kolya,`Обработай заявку,\n(@${ctx.from.username})\n(${ctx.from.first_name})\n(${ctx.from.last_name})\n(${ctx.from.id})\n пинает тебя`)
    bot.telegram.sendMessage(id_vlad,`Обработай заявку,\n(@${ctx.from.username})\n(${ctx.from.first_name})\n(${ctx.from.last_name})\n(${ctx.from.id})\n пинает тебя`)
})
// ------------------




// Сцена, Инструкция -------- (  )
const Instructions_1=new BaseScene('Instructions_1')
Instructions_1.enter(ctx=>{
    ctx.reply(`Админы еще не написали инструкцию...`,menu_keyboard)
    return ctx.scene.leave()
})
Instructions_1.leave(ctx=>{
    //bot.telegram.sendMessage(id_kolya,`Обработай заявку,\n(@${ctx.from.username})\n(${ctx.from.first_name})\n(${ctx.from.last_name})\n(${ctx.from.id})\n пинает тебя`)
    //bot.telegram.sendMessage(id_vlad,`Обработай заявку,\n(@${ctx.from.username})\n(${ctx.from.first_name})\n(${ctx.from.last_name})\n(${ctx.from.id})\n пинает тебя`)
})
// ------------------



// Сцена, старта
const Start_1=new BaseScene('Start_1')
Start_1.enter(ctx=>{
    ctx.reply('Привет, меня зовут Мартин.\nЯ бот сети II AMPERA\nТеперь я знаю о тебе и буду помогать тебе взаимодействовать с админами.',menu_keyboard)
    ctx.telegram.sendPhoto(ctx.from.id,'AgACAgIAAxkBAAIDqWFDWvI_gj7mdkv8N7ewCIex_jLgAAIZtjEbSKYZSj26dNRDnU9WAQADAgADeAADIAQ');




    // Проверка есть ли в базе такой пользоатель ----------
    let check='false'; 
    const sql1='SELECT chat_id from users';
    let mes;
    pool.query(sql1,function(err,rows) {
        for (i=0;i<rows.length;i++){
            if (rows[i].chat_id==ctx.from.id) {
                check='true;';
                //buf_id=rows[i].id;
                console.log('This &{} already exists in BD')
                break;
            }
        }

        //Если пользователя нет, то добавляем в базу -------------
        if (check==='false'){ 
            const users=[ctx.from.id,ctx.from.first_name,ctx.from.last_name,ctx.from.username,1];
            const sql2 = "INSERT INTO users(chat_id,first_name,last_name,username,status) VALUES(?,?, ?,?,?)";
            pool.query(sql2, users  , function(err, results) {
                if(err) console.log(err);
                else {
                    console.log("Adds user");
                    //mes="Поздравляем! Вы подписались на Бот\n\nИспользуйте /off чтобы приостановить подписку.";
                   // bott.sendMessage(chatId,"Поздравляем! Вы подписались на Бот\n\nИспользуйте /off чтобы приостановить подписку.")
                }

            });
            }
        // -----------------------------------

            // Случай, если пользователь в базе есть, но когда то отписался
            else{
            const data=[1,ctx.from.id];
            pool.query('UPDATE users SET status=? where chat_id=?',data,()=>{

            })
            
            console.log("Status updated at start");
            //mes="Ваша подписка активирована\n\nВы всегда можете отключить ее  с помощью команды /off.";
            //bott.sendMessage(chatId,"Ваша подписка активирована\n\nВы всегда можете отключить ее  с помощью команды /off.")
            }
             // ----------------------

        

    })
    // ------------------------------------










    return ctx.scene.leave()
})
// ------------------




const stage=new Stage([PaymentScene_1,PaymentScene_2,PaymentScene_3,
                      Add_change_mac_1,Add_change_mac_2,Add_change_mac_3,
                      Check_status_1,
                      Kick_1,
                      Instructions_1,
                      Start_1
                    ])
const bot=new Telegraf(bot_token)        // подключаемся к боту
bot.use(session())
bot.use(stage.middleware())
bot.command('/start',ctx=>ctx.scene.enter('Start_1'))
//bot.command('/name',ctx=>ctx.scene.enter('PaymentScene'))

bot.hears('💸Оставить заявку на оплату', ctx=>ctx.scene.enter('PaymentScene_1'))
bot.hears('💻Оставить заявку на изменение/добавление MAC-адресов', ctx=>ctx.scene.enter('Add_change_mac_1'))
bot.hears('👀Проверить статус заявки', ctx=>ctx.scene.enter('Check_status_1'))
bot.hears('🚨Пнуть админа,чтобы обработал заявку🤬', ctx=>ctx.scene.enter('Kick_1'))
bot.hears('📋Инструкции', ctx=>ctx.scene.enter('Instructions_1'))
bot.on('message',ctx=>{
    console.log(ctx.message.photo)
    
})



bot.launch()