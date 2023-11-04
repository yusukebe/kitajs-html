import assert from 'node:assert';
import test, { describe } from 'node:test';
import Html, { styleToString } from '../index';

describe('Style', () => {
  test('camel case property', () => {
    assert.equal(
      <>
        <div style={{ backgroundColor: 'red' }}></div>
        <div style="background-color: blue;"></div>
        <div style="background-color:green;"></div>
        <div style="backgroundColor:green;"></div>
      </>,
      '<div style="background-color:red;"></div><div style="background-color: blue;"></div><div style="background-color:green;"></div><div style="backgroundColor:green;"></div>'
    );
  });

  test('CSSProperties', () => {
    const style: JSX.CSSProperties = {
      color: 'red',
      //@ts-expect-error - should complain
      not: 'defined'
    };

    assert.equal(<div style={style} />, '<div style="color:red;not:defined;"></div>');
  });

  test('Same behavior as react', () => {
    assert.equal(
      <div
        style={{
          height: false,
          width: true,
          maxWidth: 123,
          maxHeight: 0,
          minWidth: '12a3'
        }}
      ></div>,
      <div style="max-width:123px;max-height:0;min-width:12a3;"></div>
    );
  });

  test('Weird values', () => {
    assert.equal(
      styleToString({
        a: 0,
        b: undefined,
        c: 1,
        d: '2',
        e: { f: 3 },
        f: null,
        g: true,
        h: false,
        i: NaN,
        j: Infinity,
        k: -Infinity,
        l: '',
        m: ' ',
        n: [],
        o: [1, 2, 3],
        p: {},
        q: { a: 1, b: 2, c: 3 }
      }),
      // Similar behavior to react
      'a:0;c:1px;d:2;e:[object Object];i:NaNpx;j:Infinitypx;k:-Infinitypx;l:;m: ;n:;o:1,2,3;p:[object Object];q:[object Object];'
    );
  });
});
