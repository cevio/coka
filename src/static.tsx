import React from 'react';
import { redirect, useQuery } from '../packages/coka/src';
export function Zix() {
  const p = useQuery('t')
  return <div onClick={() => redirect('/t?t=' + Date.now())}>zix - {p}</div>
}