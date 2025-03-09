export function extractHbsAttributeNamesFromString(programBody: any) {
  let attributeNames: string[] = [];
  programBody.forEach((statement: any) => {
    if (statement.type === "MustacheStatement") {
      attributeNames.push(statement.path.original);
    } else if (statement.type === "BlockStatement") {
      attributeNames = attributeNames.concat(
        extractHbsAttributeNamesFromString(statement.program.body)
      );
      if (statement.inverse) {
        attributeNames = attributeNames.concat(
          extractHbsAttributeNamesFromString(statement.inverse.body)
        );
      }
    }
  });

  return attributeNames;
}
