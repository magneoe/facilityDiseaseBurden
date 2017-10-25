
export class FilterQuery {
  constructor(private property:string, private operator:OperatorType,
              private value:string, private filterOperation:FilterOperation){}

  public getProperty():string {
    return this.property;
  }
  public getOperator(): OperatorType {
    return this.operator;
  }
  public getValue(): string {
    return this.value;
  }
  public getFilterOperation():FilterOperation {
    return this.filterOperation;
  }
  public setFilterOperation(filterOperation:FilterOperation){
    this.filterOperation = filterOperation;
  }
  public convertToFormattedQuery():string {
    let output:string = '';
    //self validation
    if(this.getProperty() === undefined || this.getValue() === undefined || this.getOperator() === undefined)
      return output;

    output += (this.getProperty() === null ? '' : this.getProperty()) + ':';
    switch (this.getOperator()){
      case OperatorType.GREATER_THAN:
        output += 'ge:';
        break;
      case OperatorType.LESS_THAN :
        output += 'le:';
            break;
      case OperatorType.EQUALS:
        output += 'eq:';
        break;
      case OperatorType.LIKE:
        output += 'like:';
        break;
    }
    output += this.getValue();

    return output;
  }
  public toString():string {
    return this.convertToFormattedQuery();
  }
}

export enum OperatorType {
  GREATER_THAN,
  LESS_THAN,
  EQUALS,
  LIKE
}

export enum FilterOperation {
  ADD, REMOVE
}