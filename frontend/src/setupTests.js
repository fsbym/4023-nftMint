import "@testing-library/jest-dom";

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () =>
      Promise.resolve({
        VRFD5: "0x31D17056f59AD0D479dF6F2Fca9BA05B0f18bb57",
        MyToken: "0x1AaD2aeD79C4f3698f05e969187A9b830f2E049C",
      }),
  })
);
