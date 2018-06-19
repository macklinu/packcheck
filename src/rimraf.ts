import { promisify } from 'util'
import rimraf from 'rimraf'

export default promisify(rimraf)
