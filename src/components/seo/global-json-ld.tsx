import { getSeoSettingsSnapshot } from "@/lib/seo";
import {
  LocalBusinessJsonLd,
  OrganizationJsonLd,
  WebSiteJsonLd,
} from "./json-ld-schemas";

export async function GlobalJsonLd() {
  const settings = await getSeoSettingsSnapshot();

  return (
    <>
      <OrganizationJsonLd settings={settings} />
      <LocalBusinessJsonLd settings={settings} />
      <WebSiteJsonLd settings={settings} />
    </>
  );
}
