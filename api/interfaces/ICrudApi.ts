interface ICrudApi<GetAll, Model, QueryParams, Dto> {
  getListFromJson(json: any): Model[];
  getAll(params: QueryParams): Promise<GetAll>;
  getById(id: number): Promise<Model>;
  createOne(dto: Dto): Promise<Model>;
  createMany(listDto: Dto[]): Promise<Model[]>;
  updateOne(input: { id: number; dto: Partial<Dto> }): Promise<Model>;
  updateMany(listInput: { id: number; dto: Partial<Dto> }[]): Promise<Model[]>;
  deleteOne(id: number): Promise<boolean>;
  deleteMany(listId: number[]): Promise<boolean>;
  softDeleteOne(id: number): Promise<boolean>;
  softDeleteMany(listId: number[]): Promise<boolean>;
  restoreOne(id: number): Promise<boolean>;
  restoreMany(listId: number[]): Promise<boolean>;
}

export default ICrudApi;
