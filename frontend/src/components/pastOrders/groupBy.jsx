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

import GroupByRow from "./groupByRow";

export default function GroupBy({ items, groupByType }) {
  function groupByItem2Person(items) {
    const grouped = [];
    const users = {};

    items.forEach((item) => {
      item.users.forEach((user, index) => {
        if (!users[user.id]) {
          users[user.id] = index;
          grouped.push({
            id: user.id,
            name: user.name,
            items: [
              {
                id: item.id,
                name: item.name,
                quantity: user.quantity,
                price: item.price
              }
            ]
          });
        } else {
          grouped[users[user.id]].items.push({
            id: item.id,
            name: item.name,
            quantity: user.quantity,
            price: item.price
          });
        }
      });
      //   item.users.forEach((user) => {
      //     const { name, quantity } = user;
      //     if (!grouped[name]) grouped[name] = [];
      //     grouped[name].push({ ...item, quantity });
      //   });
    });
    return grouped;
  }

  let grouped = items;
  let valueName = "users";
  if (groupByType === "person") {
    // Change the grouped items to be grouped by person
    /*
     * Grouped By Item
     * {
     *   id: <item id>,
     *   name: <item name>,
     *   price: <item price>,
     *   quantity: <item quantity>,
     *   users: [<user information>]
     * }
     *
     * Grouped By Person
     * {
     *   id: <user id>,
     *   name: <user name>,
     *   items: [<item information>]
     * }
     */
    grouped = groupByItem2Person(items);
    valueName = "items";
  }

  console.log(grouped);
  return (
    <div className="groupByContainer">
      {/* Display the grouped items */}
      {grouped.map((group) => (
        <div key={group.name}>
          {/* Display the group name (item name or user name) */}
          <span className="bold">{group.name}</span>

          {/* Display list of items or users */}
          <div>
            {group?.[valueName]?.map((value) => (
              <GroupByRow
                key={`${group.name}-${value.id}`}
                name={value.name}
                price={value.price || group.price}
                quantity={value.quantity || group.quantity}
                id={value.id}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
