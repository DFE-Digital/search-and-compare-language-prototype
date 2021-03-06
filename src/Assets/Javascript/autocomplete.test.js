import initAutocomplete, { requestFromApi } from "./autocomplete"

const abortMock = jest.fn()
global.XMLHttpRequest = jest.fn(() => ({
  abort: abortMock,
  addEventListener: (_, cb) => cb(),
  open: jest.fn(),
  send: jest.fn(),
  responseText: "[]",
  readyState: 2
}))

describe("Autocomplete", () => {
  describe("initAutocomplete", () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div id="outer-container">
          <input type="text" data-url="/endpoint" id="input">
          <div id="autocomplete-container"></div>
        </div>
      `

      initAutocomplete(document.getElementById("autocomplete-container"), document.getElementById("input"))
    })

    it("should create an autocomplete input", () => {
      expect(document.querySelector("#input")).toMatchSnapshot()
    })

    it("should remove the server-rendered input", () => {
      expect(document.querySelector(".outer-container > input")).toBe(null)
    })
  })

  describe("requestFromApi", () => {
    let requestFn

    beforeEach(() => {
      requestFn = requestFromApi("/endpoint")
    })

    it("should return a function", () => {
      expect(typeof requestFn).toBe("function")
    })

    describe("when called", () => {
      let cb = jest.fn()

      beforeEach(() => {
        requestFn("foo", cb)
      })

      it("should perform an ajax request", () => {
        expect(XMLHttpRequest).toBeCalled()
      })

      it("should invoke callback", () => {
        expect(cb).toBeCalled()
      })
    })

    describe("when called with a pending request", () => {
      let cb = jest.fn()

      beforeEach(() => {
        requestFn("foo", cb)
        requestFn("bar", cb)
      })

      it("should abort a request", () => {
        expect(abortMock).toBeCalled()
      })
    })
  })
})
