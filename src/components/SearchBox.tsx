import { Button, FormControl, InputGroup } from "react-bootstrap";
import { FaSearch } from "react-icons/fa";

export const SearchBox = ({
  searchInput,
  handleChange,
  handleClear,
}: {
  searchInput: string;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleClear: () => void;
}) => {
  return (
    <div className="m-1">
      <InputGroup className="mb-3">
        <InputGroup.Text>
          <FaSearch />
        </InputGroup.Text>
        <FormControl
          type="text"
          placeholder="Search..."
          value={searchInput}
          onChange={handleChange}
        />
        {searchInput && (
          <Button variant="outline-secondary" onClick={handleClear}>
            Clear
          </Button>
        )}
      </InputGroup>
    </div>
  );
};
