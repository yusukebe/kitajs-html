// Sample benchmark to test agains multiple kitajs versions

import Kita from '../index'
const KitaCurr = require('../indexCurr')
const KitaOld = require('../indexOld')
const TypedHtml = require('typed-html')
import { HelloWorld } from './renderers/hello-world'
import { startBenchmark } from './util/writer'
import { BigComponent } from './renderers/big-component'
import { ManyComponents } from './renderers/many-components'
import { ManyProps } from './renderers/many-props'

//@ts-expect-error
Kita.name = '@kitajs/html'
TypedHtml.name = 'typed-html'
KitaCurr.name = '@kitajs/html - curr'
KitaOld.name = '@kitajs/html - old'

startBenchmark(
  'benchmark.md',
  [HelloWorld, BigComponent, ManyComponents, ManyProps],

  [KitaCurr, KitaOld, Kita, TypedHtml]
).catch(console.error)
