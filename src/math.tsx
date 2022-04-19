import React from 'react';
import { useCokaEffect } from '../packages/coka/src';

export default React.memo((props: React.PropsWithChildren<{ x: number }>) => {
  const {data} = useCokaEffect(() => new Promise<string[]>(resolve => {
    console.log('get', 1)
    setTimeout(() => {
      resolve([
        "1. Wait, it doesn't wait for React to load?",
        '1. How does this even work?',
        '1. I like marshmallows',
      ])
    }, 1000);
  }), []);
  const {data: data2} = useCokaEffect(() => new Promise<string[]>((resolve, reject) => {
    setTimeout(() => {
      // reject(new Error('test coka ssr error'))
      console.log('get', 2)
      resolve([
        "2. Wait, it doesn't wait for React to load?",
        '2. How does this even work?',
        '2. I like marshmallows',
      ])
    }, 3000);
  }), []);

  const _data1 = data || [];
  const _data2 = data2 || [];
  return <div>
    <p>x: {props.x}</p>
    {
      _data1.map(d => <p key={d}>{d}</p>)
    }
    <hr />
    {
      _data2.map(d => <p key={d}>{d}</p>)
    }
    {props.children}
  </div>
})