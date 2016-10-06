import { Injectable } from '@angular/core';

import { NodeInterface } from '../node/treenode.interface';
import { Map } from '../tree/windowmapper.function';
import { ModelPtr } from '../modelptr.model';
import { intersect } from './intersect.functions';

export namespace ModelConnector {
	@Injectable()
	export class Service {
		private subscribers: Subscriber[] = [];
		private binder: ModelPtr;

		constructor() { }

		/**
		 * Add a subscriber to the subscribers list
		 * Returns a function for unsubscribing
		 */
		subscribe(sub: Subscriber) {
			this.subscribers.push(sub);

			return () => {
				let index = this.subscribers.indexOf(sub);
				if (index >= 0) {
					this.subscribers.splice(index, 1);
				}
			}
		}

		/**
		 *
		 */
		startPinning(model: ModelPtr, window: string, map: Map.WindowMapper) {
			let inputs: string[] = map.viewToInputElement(window);

			this.binder = model;
			this.subscribers.forEach((d) => {
				if (intersect(inputs, d.outputs).length > 0) {
					d.setPinStatus(true);
				}
			});
		}

		/**
		 *
		 */
		pinToModel(model: ModelPtr) {
			this.binder.setInput(model);
			this.clearPinStatus();
		}

		/**
		 * Sets all subscribers' pin-status to false and clears the service's binder
		 */
		clearPinStatus() {
			this.subscribers.forEach((d) => {
				d.setPinStatus(false);
			});
			this.binder = undefined;
		}
	}

	export interface Subscriber {
		setPinStatus(pin: boolean): void;
		inputs: string[];
		outputs: string[];
	}
}
