import assert from 'node:assert';
import test, { describe } from 'node:test';
import Html from '../index';

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
});
