/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {ErrorCode, FatalDiagnosticError} from '../../../diagnostics';
import {InputMapping} from '../../../metadata';
import {ClassMember, ReflectionHost, reflectObjectLiteral} from '../../../reflection';

import {tryParseInitializerApiMember} from './initializer_functions';
import {parseAndValidateInputAndOutputOptions} from './input_output_parse_options';

/**
 * Attempts to parse a signal input class member. Returns the parsed
 * input mapping if possible.
 */
export function tryParseSignalInputMapping(
    member: Pick<ClassMember, 'name'|'value'>, reflector: ReflectionHost,
    isCore: boolean): InputMapping|null {
  const signalInput = tryParseInitializerApiMember(['input'], member, reflector, isCore);
  if (signalInput === null) {
    return null;
  }

  const optionsNode = (signalInput.isRequired ? signalInput.call.arguments[0] :
                                                signalInput.call.arguments[1]) as ts.Expression |
      undefined;
  const options =
      optionsNode !== undefined ? parseAndValidateInputAndOutputOptions(optionsNode) : null;
  const classPropertyName = member.name;

  return {
    isSignal: true,
    classPropertyName,
    bindingPropertyName: options?.alias ?? classPropertyName,
    required: signalInput.isRequired,
    // Signal inputs do not capture complex transform metadata.
    // See more details in the `transform` type of `InputMapping`.
    transform: null,
  };
}
