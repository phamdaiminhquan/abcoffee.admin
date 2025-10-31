import styled from "styled-components";

export const StyledUpload = styled.div<{ $thumbnail?: boolean }>`
  .ant-upload {
    border: none !important;
  }
  .ant-upload-list {
    display: ${(props) => (props.$thumbnail ? "flex" : "block")};
    flex-wrap: wrap;
  }
`;

export const StyledUploadAvatar = styled.div`
  transition: opacity 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
  .ant-upload,
  .ant-upload-select {
    border: none !important;
  }
`;

export const StyledUploadBox = styled.div<{ $height?: number | string }>`
  width: 100%;
  height: ${(props) =>
		props.$height !== undefined ? (typeof props.$height === "number" ? `${props.$height}px` : props.$height) : "100%"};

  /* Ensure Ant Upload and its inner containers fill the wrapper */
  .ant-upload,
  .ant-upload-wrapper,
  .ant-upload-drag,
  .ant-upload-drag-container {
    width: 100%;
    height: 100%;
  }

  /* Remove default padding so children can truly fill area */
  .ant-upload-drag {
    padding: 0 !important;
  }

  .ant-upload {
    border: none !important;
  }
  .ant-upload-list {
    display: none;
  }
`;
