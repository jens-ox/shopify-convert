import { Component } from 'preact'
import xlsx from 'xlsx'

export default class Home extends Component {
  onChooseFile = ({ target: input }) => {
    if (!input) throw new Error("The browser does not properly implement the event object")
    if (!input.files) throw new Error("This browser does not support the `files` property of the file input.")
    if (!input.files[0]) return undefined
    const file = input.files[0]
    const fr = new FileReader()
    fr.onload = ({ target: file }) => {
      console.log('got file: ', file)
      const data = new Uint8Array(file.result)
      const content = xlsx.read(data, { type: 'array' })
      const json = xlsx.utils.sheet_to_json(content.Sheets[content.SheetNames[0]])
      const keys = Array.from(new Set(json.map(entry => Object.keys(entry)).flat()))
      const map = new Map()
      console.log('raw json: ', json)
      this.setState({ json, keys, map })
    }
    fr.readAsArrayBuffer(file)
  }

  render (_, { keys, json, map }) {
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
                      <select name="test" id="test">
                        <option value="">keine</option>
                        <option value="title">Titel</option>
                        <option value="body">Beschreibung</option>
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
      </div>
    )
  }
}
