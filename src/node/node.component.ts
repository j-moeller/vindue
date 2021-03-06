/*
 * Copyright Siemens AG, 2016
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 *
 * @author Jonas Möller
 */
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

import { DragInfo, shallowCopyDragInfo } from '../drag/draginfo.model';
import { NodeOrientation, inv, getClass } from './nodeorientation.enum';
import { SeparatorComponent } from './separator.component';
import { CardinalDirection } from '../drag/cardinaldirection.enum';
import { PanelComponent } from '../panel/panel.component';
import { PanelHeaderComponent } from '../panel/panel-header.component';
import { ModelPtr } from '../modelptr.model';

import * as NodeFunctions from './node.functions';

import { NodeInterface } from './treenode.interface';

@Component({
	selector: 'ee-node',
	styles: [`
		.ee-panel-container {
			display: flex;
			flex: 1;
			flex-direction: inherit;
			flex-direction: column !important;
			position: relative;
			background: white;
			border-radius: 10px;
			overflow: hidden;
			margin: 1px;
		}

		.ee-node, .ee-node-direction, .ee-node-resizer {
			display: flex;
			flex: 1;
			flex-direction: inherit;
			position: relative;
		}
		.ee-node-direction.hor, .ee-separator.hor {
			flex-direction: column;
		}

		.ee-node-direction.vert, .ee-separator.vert {
			flex-direction: row;
		}

		.ee-node > div > div:last-child > ee-separator {
			display: none;
		}

		ee-node, ee-panel {
			display: flex;
			flex: 1;
		}
	`],
	template: `
		<div *ngIf="node && orientation" class="ee-node">
			<div *ngIf="node.branches && node.branches.length > 0" [ngClass]="nodeClass(orientation)" class="ee-node-direction">
				<div *ngFor="let branch of node.branches; let i = index" class="ee-node-resizer" [style.flex-grow]="branch.size">
					<ee-node
						[node]="branch"
						[orientation]="nodeInv(orientation)"
						[sharedData]="sharedData"
						(insertPanel)="insertPanel($event)"
						(promotePanel)="promotePanel($event)"
						(closePanel)="deletePanel($event)"
						(on)="onPanelAction($event)">
					</ee-node>
					<ee-separator *ngIf="node.branches[i+1]" [left]="branch" [right]="node.branches[i+1]" [orientation]="orientation"></ee-separator>
				</div>
			</div>
			<div *ngIf="!node.branches || node.branches.length == 0" class="ee-panel-container">
				<ee-panel-header
					[node]="node"
					(close)="closePanel()">
				</ee-panel-header>
				<ee-panel
					[window]="node.window"
					[model]="node.model"
					[sharedData]="sharedData"
					(insert)="insert($event)"
					(on)="onPanelAction($event)">
				</ee-panel>
			</div>
		</div>
	`
})

export class NodeComponent implements OnInit {
	@Input() node: NodeInterface.TreeNode;
	@Input() orientation: NodeOrientation;

	@Input() sharedData;

	@Output("insertPanel") insertEmitter: EventEmitter<DragInfo> = new EventEmitter<DragInfo>();
	@Output("promotePanel") promoteEmitter: EventEmitter<NodeInterface.TreeNode> = new EventEmitter<NodeInterface.TreeNode>();
	@Output("closePanel") closeEmitter: EventEmitter<NodeInterface.TreeNode> = new EventEmitter<NodeInterface.TreeNode>();
	@Output("on") onEmitter: EventEmitter<any> = new EventEmitter<any>();

	/**
	 * - Set the size of the panel, if it hasn't been set.
	 * - Create a viewmodel, if the node is a branch
	 * - Set the name of the panel
	 */
	ngOnInit() {
		this.node.size = this.node.size || 1;

		if (!this.node.branches || this.node.branches.length == 0) {
			if (!this.node.model) {
				this.node.model = new ModelPtr();
			}
		}

		if (this.node.window && !this.node.name) {
			this.node.name = this.node.window;
		}
	}

	/**
	 * Wraps an external function to be used in bare html
	 */
	nodeClass(orientation: NodeOrientation): string {
		return getClass(orientation);
	}

	/**
	 * Wraps an external function to be used in bare html
	 */
	nodeInv(orientation: NodeOrientation): NodeOrientation {
		return inv(orientation);
	}

	/**
	 * Insert the panel by adding it to the parent's branch array
	 */
	insert(dragInfo: DragInfo): void {
		dragInfo.target = this.node;
		if (dragInfo.target !== dragInfo.source) {
			this.insertEmitter.emit(dragInfo);
		}
	}

	/**
	 * Insert the panel into the branch-array and close the original panel
	 */
	insertPanel(dragInfo: DragInfo) {
		if (dragInfo.direction === CardinalDirection.Center) {
			dragInfo.direction = CardinalDirection.North;
		}

		NodeFunctions.insertPanel(dragInfo, this.orientation, this.node.branches);
		dragInfo.closeOrigin();
	}

	/**
	 * Close the current panel by removing it from the parent's branch-array
	 */
	closePanel(): void {
		this.closeEmitter.emit(this.node);
	}

	/**
	 * Delete the panel from the branches-array.
	 * If only one child is left, promote this node.
	 */
	deletePanel(childNode: NodeInterface.TreeNode): void {
		NodeFunctions.deletePanel(childNode, this.node.branches);

		if (this.node.branches.length == 1) {
			this.promoteEmitter.emit(this.node);
		}
	}

	promotePanel(childNode: NodeInterface.TreeNode): void {
		NodeFunctions.promotePanel(childNode, this.node.branches);
	}

	onPanelAction(e) {
		this.onEmitter.emit(e);
	}
}
