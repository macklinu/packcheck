import { promisify } from 'util'
import mkdirp from 'mkdirp'

export default promisify(mkdirp)
