'use strict'

// EXPECTED_OUTPUT = '{"azure_ml_analysis":{"Results":{"output1":{"type":"table","value":{"ColumnNames":["Scored Labels","Scored Probabilities"],"ColumnTypes":["String","Double"],"Values":[["<=50K","0.000194414111319929"],["<=50K","0.000194414111319929"]]}}}}}';

const amqp = require('amqplib')

let _app = null
let _channel = null
let _conn = null

describe('Azure Machine Learning Service', function () {
  this.slow(5000)

  before('init', () => {
    process.env.OUTPUT_PIPES = 'Op1,Op2'
    process.env.LOGGERS = 'logger1,logger2'
    process.env.EXCEPTION_LOGGERS = 'exlogger1,exlogger2'
    process.env.BROKER = 'amqp://guest:guest@127.0.0.1/'
    process.env.CONFIG = '{"apiKey": "sYws8tBQvk+FqK5Gy14wxC7A0zF2cRhoac1iYkbtEfzWCt8bwCYE4skpK4yS5lsHtkHecN6u0ATmm9K9Zs0rHQ==", ' +
	  '"serviceUri": "https://asiasoutheast.services.azureml.net/workspaces/3c191c2446e74f3ca9e57cfd63430395/services/51ce9f7f75cf41fbaa1ef25201d18650/execute?api-version=2.0&details=true"}'
    process.env.INPUT_PIPE = 'demo.pipe.service'
    process.env.OUTPUT_SCHEME = 'RESULT'
    process.env.OUTPUT_NAMESPACE = 'RESULT'
    process.env.ACCOUNT = 'demo account'

    amqp.connect(process.env.BROKER)
      .then((conn) => {
        _conn = conn
        return conn.createChannel()
      }).then((channel) => {
      _channel = channel
    }).catch((err) => {
      console.log(err)
    })
  })

  after('terminate child process', function (done) {
    _conn.close()
    done()
  })

  describe('#start', function () {
    it('should start the app', function (done) {
      this.timeout(8000)
      _app = require('../app')
      _app.once('init', done)
    })
  })

  describe('#data', () => {
    it('should process the data and send back a result', function (done) {
      this.timeout(11000)
	  let dummyData = '{"Inputs":{"input1":{"ColumnNames":["age","workclass","fnlwgt","education","education-num","marital-status","occupation","relationship","race","sex","capital-gain","capital-loss","hours-per-week","native-country"],"Values":[["0","value","0","value","0","value","value","value","value","value","0","0","0","value"],["0","value","0","value","0","value","value","value","value","value","0","0","0","value"]]}},"GlobalParameters":{}}'
      _channel.sendToQueue('demo.pipe.service', new Buffer(JSON.stringify(dummyData)))

      setTimeout(done, 10000)
    })
  })
})
