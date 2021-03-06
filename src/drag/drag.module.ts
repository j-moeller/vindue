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
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/* Drag-Elements */
import { DragService } from './drag.service';
import { DragStart } from './dragstart.directive';
import { DropIndicator } from './dropindicator.directive';
import { DropZone } from './dropzone.directive';

@NgModule({
	imports: [ CommonModule, FormsModule ],
	declarations: [ DragStart, DropIndicator, DropZone],
	exports: [ DragStart, DropIndicator, DropZone ],
	providers: [ DragService ]
})

export class DragModule { }
