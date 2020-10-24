import { Component } from 'preact'
import xlsx from 'xlsx'
import { convertArrayToCSV } from 'convert-array-to-csv'

const rawHeader = ['Handle', 'Title', 'Body (HTML)', 'Vendor', 'Type', 'Tags', 'Published', 'Option1 Name', 'Option1 Value', 'Option2 Name', 'Option2 Value', 'Option3 Name', 'Option3 Value', 'Variant SKU', 'Variant Grams', 'Variant Inventory Tracker', 'Variant Inventory Qty', 'Variant Inventory Policy', 'Variant Fulfillment Service', 'Variant Price', 'Variant Compare At Price', 'Variant Requires Shipping', 'Variant Taxable', 'Variant Barcode', 'Image Src', 'Image Position', 'Image Alt Text', 'Gift Card', 'SEO Title', 'SEO Description', 'Google Shopping / Google Product Category', 'Google Shopping / Gender', 'Google Shopping / Age Group', 'Google Shopping / MPN', 'Google Shopping / AdWords Grouping', 'Google Shopping / AdWords Labels', 'Google Shopping / Condition', 'Google Shopping / Custom Product', 'Google Shopping / Custom Label 0', 'Google Shopping / Custom Label 1', 'Google Shopping / Custom Label 2', 'Google Shopping / Custom Label 3', 'Google Shopping / Custom Label 4', 'Variant Image', 'Variant Weight Unit', 'Variant Tax Code', 'Cost per item']

const customParsers = [{
  name: 'Variant Compare At Price',
  parse: entry => entry !== 0 ? entry : ''
}]

const defaults = [{
  name: 'Published',
  value: () => true
}, {
  name: 'Variant Inventory Qty',
  value: () => 0
}, {
  name: 'Variant Inventory Policy',
  value: () => 'deny'
}, {
  name: 'Variant Fulfillment Service',
  value: () => 'manual'
}, {
  name: 'Variant Requires Shipping',
  value: () => true
}, {
  name: 'Variant Taxable',
  value: () => true
}, {
  name: 'Gift Card',
  value: () => false
}, {
  name: 'Handle',
  value: () => null
}, {
  name: 'Option1 Name',
  value: () => 'Title'
}, {
  name: 'Option1 Value',
  value: () => 'Default Title'
}]

export default class Home extends Component {
  onChooseFile = ({ target: input }) => {
    if (!input) throw new Error('The browser does not properly implement the event object')
    if (!input.files) throw new Error('This browser does not support the `files` property of the file input.')
    if (!input.files[0]) return undefined
    const file = input.files[0]
    const fr = new FileReader()
    fr.onload = ({ target: file }) => {
      const data = new Uint8Array(file.result)
      const content = xlsx.read(data, { type: 'array' })
      const json = xlsx.utils.sheet_to_json(content.Sheets[content.SheetNames[0]])
      const keys = Array.from(new Set(json.map(entry => Object.keys(entry)).flat()))
      const map = new Map()
      this.setState({ json, keys, map })
    }
    fr.readAsArrayBuffer(file)
  }

  onSelect = tableKey => event => {
    const whichField = event.target.value
    console.log(tableKey, whichField)
    const map = this.state.map
    if (whichField !== '') map.set(tableKey, whichField)
    else map.delete(tableKey)
    this.setState({ map })
  }

  convertToCsv = () => {
    console.log('converting to csv')

    // reverse map for easier lookup
    const shopifyToSelected = new Map(Array.from(this.state.map, a => a.reverse()))
    const setKeys = Array.from(shopifyToSelected.keys())
    // map data to shopify format
    const data = this.state.json.map(entry => {
      return setKeys.map(shopifyField => {
        // if no field is set, use default if exists
        if (!shopifyToSelected.has(shopifyField)) {
          const defaultValue = defaults.find(def => def.name === shopifyField)
          return defaultValue
            ? defaultValue.value(entry)
            : null
        }

        // if a custom parser exists, pre-parse
        const value = entry[shopifyToSelected.get(shopifyField)]
        const parser = customParsers.find(p => p.name === shopifyField)
        return parser
          ? parser.parse(value)
          : value
      })
    })

    // convert to csv
    const csv = convertArrayToCSV(data, { header: setKeys })
    console.log('csv: ', csv)

    // wrap as blob and send for download
    const blob = new Blob([csv], { type: 'text/csv' })
    if (window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveBlob(blob, 'export.csv')
    } else {
      const elem = window.document.createElement('a')
      elem.href = window.URL.createObjectURL(blob)
      elem.download = 'export.csv'
      document.body.appendChild(elem)
      elem.click()
      document.body.removeChild(elem)
    }
  }

  render (_, { keys, json, map }) {
    const availableOptions = map ? rawHeader.filter((_, i) => !map.has(i)) : []
    const mapNotEmpty = map && map.size > 0

    return (
      <div class="container px-1">
        <h1>
          Excel zu Shopify konvertieren
        </h1>
        <section>
          <p>
            Mit diesem Tool lassen sich Daten von Excel zu Shopify konvertieren.
          </p>
          <p>
            Nach der Auswahl einer Datei wird diese lokal analysiert - Ihre Daten bleiben auf Ihrem Rechner und werden nicht über das Internet übertragen.
          </p>
        </section>
        <section>
          <h3 className="block">Schritt 1: Datei auswählen</h3>
          <input type="file" onChange={this.onChooseFile} />
        </section>
        {keys && (
          <section>
            <h3 className="block">Schritt 2: Welche Spalte hat welche Bedeutung?</h3>
            <table className="table-mapping">
              <thead>
                <tr>
                  <th>Spalte</th>
                  <th>Bedeutung</th>
                  <th>Beispiel</th>
                </tr>
              </thead>
              <tbody>
                {keys.map(key => (
                  <tr>
                    <td>{key}</td>
                    <td>
                      <select name="test" id="test" onChange={this.onSelect(key)}>
                        <option value="">keine</option>
                        {availableOptions.map(option => (
                          <option value={option}>{option}</option>
                        ))}
                      </select>
                    </td>
                    {json[0] && (
                      <td className="text-sm text-gray-700">
                        <pre>{json[0][key]}</pre>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
        {mapNotEmpty && (
          <section>
            <h3 className="block">Schritt 3: Daten exportieren</h3>
            <button className="button" onClick={this.convertToCsv}>Daten als CSV herunterladen</button>
          </section>
        )}
      </div>
    )
  }
}
