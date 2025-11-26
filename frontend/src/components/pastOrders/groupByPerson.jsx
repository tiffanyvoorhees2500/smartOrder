// {
//     "itemId": 1,
//     "itemName": "Item 1",
//     "price": 10,
//     "users": [
//         {
//             "name": "User 1",
//             "quantity": 2
//         },
//         {
//             "name": "User 2",
//             "quantity": 5
//         }
//     ]
// }

export default function GroupByPerson({ items }) {
  function groupByItem2Person(items) {
    const grouped = {};
    items.forEach((item) => {
      item.users.forEach((user) => {
        const { name, quantity } = user;
        if (!grouped[name]) grouped[name] = [];
        grouped[name].push({ ...item, quantity });
      });
    });
    return grouped;
  }

  const grouped = groupByItem2Person(items);
  return (
    <div>
      {Object.entries(grouped).map(([name, items]) => (
        <div key={name}>
          <span className="bold">{name}</span>
          <div>
            {items.map((item) => (
              <div key={`${name}-${item.itemId}`} className="groupBy">
                <span>
                  {item.quantity} {item.itemName}
                </span>
                <span>
                  {item.quantity} @ ${item.price} = $
                  {(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
