
const { LOG } = require('../../../../utils/util');
const { SelectRowsBySql } = require('../../../../rzhd/db/sqlselect');

async function RunApp(req, res) {

  //  Запуск диалога - начало. Запустить объяснение - что и для чего.
    if (req.body.request.command == "no text")
    {
      res.json({
        version: req.body.version,
        session: req.body.session,
        response: {
          text: "Сейчас объясню как всё работает",
          end_session: false,
        },
      });
    }
  
    //  
    else if (req.body.request.command == "no version")
    {
      res.json({
        session: req.body.session,
        response: {
          text: req.body.request.command || 'Hello!',
          end_session: false,
        },
      });
    }
  
    //
    else if (req.body.request.command == "no session")
    {
      res.json({
        version: req.body.version,
        response: {
          text: req.body.request.command || 'Hello!',
          end_session: false,
        },
      });
    }
  
    //  Запрос на закрытие диалога
    else if (req.body.request.command == "end session")
    {
      res.json({
        version: req.body.version,
        session: req.body.session,
        response: {
          text: req.body.request.command || 'Hello!',
          end_session: true,
        },
      });
    }
  
    //  Иначе - нужно обрабатывать очередную фразу...
    else 
    {
      res.json({
        version: req.body.version,
        session: req.body.session,
          response: {
            text: req.body.request.command || 'Привет!',
            
            end_session: false,
          },
      })
    ;}
}
module.exports.RunApp = RunApp;