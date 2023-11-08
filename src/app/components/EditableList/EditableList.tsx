import React, { FormEvent, useState } from "react";
import { EditableListItem } from "@/types/editableListItem";

const EditableList = ({
  className,
  items,
  onUpdate,
  emptyItemsText = "No items yet.",
}: {
  className: string;
  items: EditableListItem[];
  onUpdate: (updatedItems: EditableListItem[]) => void;
  emptyItemsText: string;
}) => {
  const [itemToEdit, setItemToEdit] = useState<EditableListItem | null>(null);
  const [itemToEditText, setItemToEditText] = useState("");

  const updateItem = (updatedItem: EditableListItem) => {
    return items.map((item) => {
      if (updatedItem.id === item.id) {
        return { name: updatedItem.name, id: item.id };
      }
      return { name: item.name, id: item.id };
    });
  };
  const deleteItem = (itemToRemove: EditableListItem) => {
    onUpdate(
      cloneBaseItems(items.filter((item) => item.id !== itemToRemove.id)),
    );
  };

  const cloneBaseItems = (items: EditableListItem[]) => {
    return items.map((item) => {
      return { id: item.id, name: item.name };
    });
  };

  return (
    <ul className={className}>
      {items && items.length > 0 ? (
        items.map((item) => {
          return (
            <li
              key={item.id}
              className={`mb-2 border pl-2 ${
                itemToEdit?.id !== item.id ? "hover:bg-base-300" : ""
              }`}
            >
              {itemToEdit?.id !== item.id ? (
                <div className="flex flex-row space-x-2 items-center">
                  <span className="text-2xl text-secondary-content-content font-medium grow">
                    {item.name}
                  </span>
                  <button
                    className="btn btn-md hover:btn-primary"
                    onClick={() => {
                      setItemToEdit(item);
                      setItemToEditText(item.name);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-md hover:btn-primary"
                    onClick={() => deleteItem(item)}
                  >
                    Delete
                  </button>
                </div>
              ) : (
                <div className="flex">
                  <input
                    id="edit-item-input"
                    className="input input-bordered input-primary w-full mb-2"
                    type="text"
                    placeholder="Name of item to vote on"
                    value={itemToEditText}
                    onChange={(e: FormEvent<HTMLInputElement>) =>
                      setItemToEditText(e.currentTarget.value)
                    }
                    onBlur={() => {
                      const newName = itemToEditText.trim();
                      setItemToEditText("");
                      setItemToEdit(null);
                      onUpdate(updateItem({ name: newName, id: item.id }));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        e.currentTarget.blur();
                      }
                    }}
                  />
                  <button
                    className="btn btn-primary ml-2"
                    onClick={() => {
                      const newName = itemToEditText.trim();
                      setItemToEditText("");
                      setItemToEdit(null);
                      onUpdate(updateItem({ name: newName, id: item.id }));
                    }}
                  >
                    Save
                  </button>
                </div>
              )}
            </li>
          );
        })
      ) : (
        <li className="text-secondary">{emptyItemsText}</li>
      )}
    </ul>
  );
};

export default EditableList;
