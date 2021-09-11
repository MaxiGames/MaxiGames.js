class Collection {
  document: { [id: string]: Document } = {};
}

class Document {
  collection: Collection | null = null;
  fields: { [fieldName: string]: any }[] = [];
}
