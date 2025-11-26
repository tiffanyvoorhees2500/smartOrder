export default function GroupByRow({ id, quantity, name, price }) {
  return (
    <div key={`${name}-${id}`} className="groupBy">
      {/* Left side of the row (quantity and name) */}
      <span>
        <span className="groupByQuantity">{quantity}</span> {name}
      </span>

      {/* Right side of the row (quantity, price, total) */}
      <span>
        {quantity} @ ${price} = ${(price * quantity).toFixed(2)}
      </span>
    </div>
  );
}
