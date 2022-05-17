/**
 * @license Coka
 * @coka/coka.js
 *
 * Copyright (c) Coka, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import 'reflect-metadata';
import { inject, injectable } from 'inversify';

export * from './coka';
export * from './router';
export * from './component';
export * from './decorators';
export * from './hooks';
export * from './popstate';
export * from './hashchange';
export * from './types';
export * from './provider';
// export * from './dynamic';

export {
  inject,
  injectable,
}