/* eslint-env node, mocha */
'use strict'

const NoFilter = require('../')
const { expect } = require('chai')

describe('When streaming', () => {
  it('listens for pipe events', () => {
    const nf1 = new NoFilter({
      objectMode: true})
    const nf2 = new NoFilter({
      objectMode: false})

    nf1.pipe(nf2)
    return expect(nf2._readableState.objectMode).true
  })

  it('does not have to listen for pipe events', () => {
    const nf1 = new NoFilter({
      objectMode: true})
    const nf2 = new NoFilter({
      objectMode: false,
      watchPipe: false
    })

    nf1.pipe(nf2)
    return expect(nf2._readableState.objectMode).false
  })

  it('does not allow piping after writing', () => {
    const nf1 = new NoFilter({
      objectMode: true})
    const nf2 = new NoFilter({
      objectMode: false})
    nf2.write('123')
    return expect(() => nf1.pipe(nf2)).to.throw(Error)
  })

  it('can generate a promise', () => {
    const nf = new NoFilter()
    const p = nf.promise()
      .then(val => expect(val).eql(Buffer.from('123')))
    nf.end('123')
    return p
  })

  it('can generate a rejected promise', () => {
    const nf = new NoFilter()
    const p = nf.promise()
      .catch(er => expect(er).instanceof(Error))

    nf.end({
      a: 1})
    return p
  })

  it('can generate a promise and a callback', () => {
    const nf = new NoFilter()
    const p = nf.promise((er, val) => {
      expect(er).null
      expect(val).eql(Buffer.from('123'))
    })
    nf.end('123')
    return p
  })

  return it('can generate a rejected promise and a callback', () => {
    const nf = new NoFilter()
    const p = nf.promise((er, val) => {
      expect(er).instanceof(TypeError)
      return expect(val).is.undefined
    })

    nf.end({
      a: 1})
    return p.catch(er => expect(er).instanceof(TypeError))
  })
})
