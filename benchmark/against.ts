// Sample benchmark to test agains multiple kitajs versions

import Kita from '../index'
const Kita2 = require('../index2')
// const Kita3 = require('../index3')
const TypedHtml = require('typed-html')
import { HelloWorld } from './renderers/hello-world'
import { startBenchmark } from './util/writer'
import { MdnHomepage } from './renderers/mdn-homepage'
import { ManyComponents } from './renderers/many-components'
import { ManyProps } from './renderers/many-props'

//@ts-expect-error
Kita.name = '@kitajs/html'
TypedHtml.name = 'typed-html'
Kita2.name = '@kitajs/html -- v2'
// Kita3.name = '@kitajs/html -- v3'

startBenchmark(
  'benchmark.md',
  [HelloWorld, MdnHomepage, ManyComponents, ManyProps],

  [TypedHtml, Kita, Kita2]
).catch(console.error)
