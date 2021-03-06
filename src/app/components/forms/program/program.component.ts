import {
    Component, ComponentFactoryResolver, Input, OnChanges, OnInit, ViewChild,
    ViewContainerRef
} from '@angular/core';

import {ProgramsService} from '../../../services/dataLoading/programs.service';
import {Program} from "../../../models/Program.model";
import {OrganizationUnit} from "../../../models/OrganizationUnit.model";
import {MapInputDataService} from "../../../services/dataInput/mapInputData.service";
import {ProgramFilterComponent} from "./programFilter.component";
import {InputDataMessage} from "../../../models/InputDataMessage.model";
import {InputDataContent} from "../../../enums/InputDataContent.enum";

@Component({
    selector: 'programPicker',
    templateUrl: '../../../views/program/program.component.html',
    providers: [ProgramsService]
})

/*
 * This component represent DHIS2 programs loaded into checkboxes in the view.
 *
 */
export class ProgramsComponent implements OnChanges, OnInit {
    @Input() selectedOrgUnit: OrganizationUnit;
    @Input() RECIEVER_ADDRESS:number;
    programs: Program[] = [];
    selectedProgram: Program;

    private query: string;
    @ViewChild('programFilterContainer', {read: ViewContainerRef}) container: ViewContainerRef;

    constructor(private _progService: ProgramsService,
                private _mapInputDataService: MapInputDataService,
                private _cfr: ComponentFactoryResolver) {
    }

    /*
     * Upon changes in the input (organisationUnit), then reload the programs
     */
    ngOnChanges(changes: any) {
        this.showPrograms(this.selectedOrgUnit);
    }

    ngOnInit() {
    }

    /*
     * Loads the programs thats connected to a given org.unit
     */
    showPrograms(orgUnit: OrganizationUnit): void {
        if (orgUnit == null) {
            this.programs = [];
            return;
        }
        this.query = 'organisationUnits?filter=id:eq:' + orgUnit.id + '&fields=programs[id,displayName]&paging=0';
        this._progService.loadPrograms(this.query)
            .subscribe((units: any) => {
                this.programs = units.organisationUnits[0].programs;
                this.selectedProgram = null;
                this.sendInputDataMessage();
            });
    }

    /*
     * Send a ValidationMessage upon changes in the checkbox selection
     */
    selectProgram(event: any): void {
        this.container.clear();

        let comp = this._cfr.resolveComponentFactory(ProgramFilterComponent);
        let filterComp = this.container.createComponent(comp);
        filterComp.instance._ref = filterComp;
        filterComp.instance.setProgram(this.selectedProgram);
        filterComp.instance.setSelectedOrgUnit(this.selectedOrgUnit);
        filterComp.instance.setRecieverAddress(this.RECIEVER_ADDRESS);

        this.sendInputDataMessage();
    }

    private sendInputDataMessage():void {
        //Send datamessage to the appMainContainer.
        let inputDataMessage = new InputDataMessage(null, InputDataContent.PROGRAMS,
            [this.selectedProgram], this.RECIEVER_ADDRESS);
        this._mapInputDataService.sendInputDataMessage(inputDataMessage);
    }
}
