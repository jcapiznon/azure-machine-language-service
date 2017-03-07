'use strict'

const reekoh = require('reekoh')
const _plugin = new reekoh.plugins.Service()

const _get = require('lodash.get')
const request = require('request')
const isEmpty = require('lodash.isempty')
const isPlainObject = require('lodash.isplainobject')

_plugin.on('data', (data) => {
  data = JSON.parse(data)
  if (!isPlainObject(data)) {
    return _plugin.logException(new Error(`Invalid data received. Must be a valid JSON Object. Data: ${data}`))
  }

  if (isEmpty(data)) {
    return _plugin.logException(new Error('Invalid data received. Data must not be empty.'))
  }

  request.post({
    url: 'https://asiasoutheast.services.azureml.net/workspaces/3c191c2446e74f3ca9e57cfd63430395/services/51ce9f7f75cf41fbaa1ef25201d18650/execute?api-version=2.0&details=true',
    body: data,
    json: true,
    gzip: true,
    auth: {
      bearer: 'sYws8tBQvk+FqK5Gy14wxC7A0zF2cRhoac1iYkbtEfzWCt8bwCYE4skpK4yS5lsHtkHecN6u0ATmm9K9Zs0rHQ=='
    }
  }, (error, response, body) => {
    if (error) {
      console.error('1', error)
      _plugin.logException(error)
    } else if (response.statusCode !== 200) {
      console.error('2', error)
      _plugin.logException(new Error(_get(body, 'error.details[0].message')))
    } else {
      _plugin.pipe(data, JSON.stringify({
        azureMlAnalysis: body
      }))
        .then(() => {
        _plugin.log(JSON.stringify({
          title: 'Successfuly Analyzed',
          data: data,
          result: body
        }))
        })
    }
  })
})

_plugin.once('ready', () => {
  _plugin.log('Azure Machine Learning Service has been initialized.')
  _plugin.emit('init')
})

module.exports = _plugin
